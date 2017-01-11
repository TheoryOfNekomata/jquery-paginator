(function () {
    var Page = function Page($paginator, pageNumber) {
        var $page = $('<div>'),
            $content = $('<div>'),
            $margin = $('<div>');

        $margin.addClass('margin');

        pageNumber = pageNumber || $paginator.data('lastPageNumber');

        $content
            .addClass('content')
            .append($margin);

        function conditionallyAppendHeader() {
            var $headers = $paginator.find('.model').find('.header'),
                $header,
                $margin,
                headerIndex,
                headerCount = $headers.length;

            if (headerCount < 1) {
                return;
            }

            headerIndex = pageNumber % headerCount;
            $header = $headers.eq(headerIndex).clone(true, true);

            if ($header.hasClass('terminal') && pageNumber > 0) {
                return;
            }

            $margin = $('<div>');
            $margin.addClass('margin');
            $header.children().each(function () {
                $margin.append(this);
            });
            $header.append($margin);
            $page.prepend($header);
            setTimeout(function () {
                $content.css('margin-top', $header.height());
            });
        }

        function conditionallyAppendFooter() {
            var $footers = $paginator.find('.model').find('.footer'),
                $footer,
                footerIndex,
                footerCount = $footers.length,
                $margin;

            if (footerCount < 1) {
                return;
            }

            footerIndex = pageNumber % footerCount;
            $footer = $footers.eq(footerIndex).clone(true, true);

            if ($footer.hasClass('terminal') && pageNumber < $paginator.data('lastPageNumber') - 1) {
                return;
            }

            $margin = $('<div>');
            $margin.addClass('margin');
            $footer.children().each(function () {
                $margin.append(this);
            });

            $footer
                .append($margin);

            $page
                .append($footer);

            setTimeout(function () {
                $content.css('margin-bottom', $footer.height());
            });
        }

        $page.getContentHeight = function getContentHeight() {
            var $header = this.find('.header'),
                $footer = this.find('.footer'),
                topHeight = Math.max($header.length > 0 ? $header.height() : 0, parseInt($margin.css('margin-top'))),
                bottomHeight = Math.max($footer.length > 0 ? $footer.height() : 0, parseInt($margin.css('margin-top')));

            return this.height() - topHeight - bottomHeight;
        };

        $page.needsBreaking = function needsBreaking() {
            return $content.height() > this.getContentHeight();
        };

        $page.setPageNumber = function setPageNumber(pageNumber) {
            this.data('pageNumber', pageNumber);

            this.find('.header').remove();
            this.find('.footer').remove();

            conditionallyAppendHeader();
            conditionallyAppendFooter();
        };

        $page
            .addClass('page')
            .append($content);

        $page.setPageNumber(pageNumber);

        return $page;
    };

    $.fn.paginate = function Paginator() {
        var $paginator = this,
            $model = $('<div>'),
            $modelWatch = $('<div>'),
            $view = $('<div>'),
            modelObserver = new MutationObserver(onWatchChange),
            lastPageNumber = 0,
            $pages = [],
            pageBlockClass = 'page-block',
            pageAddedClass = 'page-added',
            pageDeletedClass = 'page-deleted',
            $modelParents = [],
            debounce = 500,
            debounceTimer = null,
            isEventTriggered = false;

        function toClassSelector(classString) {
            return '.' + classString.split(' ').filter(function (string) { return string.trim().length > 0 }).join('.');
        }

        function layoutContent() {
            $model
                .find(toClassSelector(pageBlockClass))
                .each(function () {
                    var $content = $(this),
                        $modelParent = $content.parent();

                    if ($content.parents(toClassSelector(pageDeletedClass)).length > 0) {
                        return;
                    }

                    $modelParent.attr('data-order', 0);
                    $content
                        .data('$modelParent', $modelParent)
                        .removeClass(pageBlockClass)
                        .addClass(pageAddedClass);
                    $modelParents.push($modelParent);
                    $pages[0].find('.content').find('.margin').append($content);
                });

            $model
                .find('[data-order]')
                .each(function (i) {
                    $(this).attr('data-order', i);
                });

            $view
                .find('.content')
                .find('.margin')
                .children()
                .each(function () {
                    var $content = $(this),
                        $modelParent = $content.data('$modelParent');

                    if (!$modelParent) {
                        $content.remove();
                        return;
                    }

                    if (!($modelParent.hasClass(pageDeletedClass) ||
                        $modelParent.parents().length < 1 ||
                        $modelParent.parents(toClassSelector(pageDeletedClass)).length > 0)) {
                        //if ($content.css('float') === 'none') {
                            $content.attr('data-order', $modelParent.attr('data-order'));
                        //}
                        return;
                    }

                    $content.remove();
                });
        }

        function orderContent() {
            var $children = $view.find('.content').find('.margin').children();

            $children
                .each(function () {
                    var $content = $(this),
                        $prev = $content.prev(),
                        $modelParent,
                        $prevParent;

                    $modelParent = $content.data('$modelParent');

                    if ($prev.length > 0) {
                        $prevParent = $prev.data('$modelParent');
                    }

                    if (!$prevParent) {
                        return;
                    }

                    if (parseInt($modelParent.attr('data-order')) < parseInt($prevParent.attr('data-order'))) {
                        $content.insertBefore($prev);
                    }
                });
        }

        function analyzePageBreaks() {
            var pagesWithBreaks;

            function getPagesWithBreaks() {
                var pagesWithBreaks = [];

                $pages.forEach(function ($page, i) {
                    var contentHeight = $page.getContentHeight(),
                        pageHasBreaks = false,
                        $contents = $page.find('.content').find('.margin').children();

                    $contents.each(function () {
                        var $this = $(this),
                            position = $this.position().top,
                            height = $this.height(),
                            pageContentLowerBoundary = parseInt($page.find('.content').css('margin-top')) + contentHeight;

                        pageHasBreaks = pageHasBreaks || position + height > pageContentLowerBoundary;
                    });

                    if (!pageHasBreaks) {
                        $page.removeClass('-overflow');
                        return;
                    }

                    $page.addClass('-overflow');
                    pagesWithBreaks.push(i);
                });

                return pagesWithBreaks;
            }

            function splitContent(pageNumbers) {
                pageNumbers.forEach(function (pageNumber, i) {
                    var toNextPage = [],
                        $page = $pages[pageNumber],
                        contentHeight = $page.getContentHeight(),
                        hasPageBreak = false;

                    $page.find('.content').find('.margin').children().each(function () {
                        var $this = $(this),
                            position = $this.position().top,
                            height = $this.height(),
                            pageMargin = parseInt($page.find('.content').css('margin-top')),
                            pageContentLowerBoundary = pageMargin + contentHeight;

                        //hasPageBreak = hasPageBreak || $this.hasClass('page-break');

                        //if ($this.hasClass('page-break') && (!$pages[pageNumber + 1] || $pages[pageNumber + 1 ].find('.content').find('.margin').children().length < 1)) {
                        //    hasPageBreak = true;
                        //    return;
                        //}

                        if (hasPageBreak || position + height > pageContentLowerBoundary) {
                            toNextPage.unshift(this);
                        }
                    });

                    while (toNextPage.length > 0) {
                        if (!$pages[ pageNumber + 1 ]) {
                            $view.append(
                                $pages[ pageNumber + 1 ] = new Page($paginator, pageNumber + 1)
                            );
                        }
                        $pages[ pageNumber + 1 ].find('.content').find('.margin').prepend(toNextPage.shift());
                        $paginator.data('lastPageNumber', pageNumber + 1);
                    }
                });
            }

            do {
                splitContent(pagesWithBreaks = getPagesWithBreaks());
            } while (pagesWithBreaks.length > 0);
        }

        function showAllPages() {
            $pages.forEach(function ($page, i) {
                $page
                    .removeAttr('hidden')
                    .setPageNumber(i);
            });
        }

        function hideBlankPages() {
            $pages.forEach(function ($page, i) {
                if ($page.find('.content').find('.margin').children().length > 0 || i < 1) {
                    return;
                }
                $page.attr('hidden', '');
            });
        }

        function resetPageNumber() {
            $paginator.trigger('paginator.pagenumberchange', { lastPageNumber: lastPageNumber });
            $paginator.data('lastPageNumber', $view.find('.page').length);
        }

        function doRender() {
            $paginator.data('_isRendering', true);
            resetPageNumber();
            if (!$pages[lastPageNumber]) {
                $view.append(
                    $pages[lastPageNumber] = new Page($paginator, lastPageNumber)
                );

                if ($view.find('.page').css('height') === 'auto') {
                    throw new Error('Page dimensions should be explicitly set up! Either you have not included the default style or pages\' dimensions have been set to auto.');
                }
            }

            showAllPages();
            layoutContent();
            orderContent();
            analyzePageBreaks();
            hideBlankPages();
            orderContent();

            setTimeout(function () {
                $paginator.data('_isRendering', false);
                $paginator.trigger('paginator.modelchangeend', {});
            });
        }

        function onWatchChange(changes) {
            //if (!isEventTriggered) {
                $paginator.trigger('paginator.modelchangestart', {});
                //isEventTriggered = true;
            //}

            if (!!$paginator.data('_isRendering')) {
                return;
            }

            if (!!debounceTimer) {
                clearTimeout(debounceTimer);
            }

            debounceTimer = setTimeout(function () {
                doRender();
            }, debounce);
        }

        $modelWatch
            .addClass('watch')
            .append($paginator.children());

        modelObserver
            .observe($modelWatch[0], {
                childList: true,
                attributes: true,
                characterData: true,
                subtree: true
            });

        $model
            .addClass('model')
            .append($modelWatch);

        $view
            .addClass('view')
            .append($pages[0]);

        $paginator
            .addClass('paginator-component')
            .append($model)
            .append($view);

        setTimeout(function () {
            doRender();
        });
    };
})();

//# sourceMappingURL=jquery-paginator.js.map
