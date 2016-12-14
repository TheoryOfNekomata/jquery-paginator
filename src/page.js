(function () {
    function conditionallyAppendHeader($paginator, $page) {
        var $header;

        $header = $paginator.$$model.find('.header');

        if ($header.length > 0) {
            $header = $header.eq($header.length > 1 ? (($paginator._lastPageNumber - 1) % $header.length) : 0).clone(true, true);

            if ($header.hasClass('terminal') && $paginator._lastPageNumber !== 1) {
                return;
            }
            
            $header.children().wrapAll('<div class="margin">');

            $page.append($header);
            $page.$content.css('margin-top', $header.outerHeight(true));
        }
    }

    function conditionallyAppendFooter($paginator, $page) {
        var $footer;

        $footer = $paginator.$$model.find('.footer');

        if ($footer.length > 0) {
            $footer = $footer.eq($footer.length > 1 ? (($paginator._lastPageNumber - 1) % $footer.length) : 0).clone(true, true);

            if ($footer.hasClass('terminal') && $paginator._lastPageNumber !== 1) {
                return;
            }

            $footer.children().wrapAll('<div class="margin">');

            $page.append($footer);
            $page.$content.css('margin-bottom', $footer.outerHeight(true));
        }
    }

    function getContentHeight($page) {
        var $header = $page.find('.header'),
            $footer = $page.find('.footer'),
            topHeight = Math.max($header.length > 0 ? $header.height() : 0, parseInt($page.$margin.css('margin-top'))),
            bottomHeight = Math.max($footer.length > 0 ? $footer.height() : 0, parseInt($page.$margin.css('margin-top')));

        return $page.height() - topHeight - bottomHeight;
    }

    Paginator.Page = function Page($paginator) {
        var $page, settings;

        settings = $paginator.data('settings');

        $page = $('<div>');
        $page.addClass('page');

        $page.$content = $('<div>');
        $page.$content.addClass('content');

        $page.$margin = $('<div>');
        $page.$margin.addClass('margin');

        $page.needsBreaking = function needsBreaking() {
            return this.$content.height() > getContentHeight(this);
        };

        $paginator._lastPageNumber++;
        $paginator.$$view.append($page);
        conditionallyAppendHeader($paginator, $page);
        conditionallyAppendFooter($paginator, $page);

        $page.append($page.$content);
        $page.$content.append($page.$margin);

        return $page;
    }
})();
