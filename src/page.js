(function () {
    /**
     * Class for the paginator's page.
     * @param {Paginator.Component} $paginator The paginator.
     * @param {number} pageNumber The page number.
     * @returns {jQuery} The page element.
     * @constructor
     */
    Paginator.Page = function Page($paginator, pageNumber) {
        var $page, settings;

        settings = $paginator.data('settings');

        $page = $('<div>');
        $page.$content = $('<div>');
        $page.$margin = $('<div>');

        /**
         * Gets the height of the page that can allow content.
         * @returns {number} The content height of the page.
         */
        $page.getContentHeight = function getContentHeight() {
            var $header = this.find('.header'),
                $footer = this.find('.footer'),
                topHeight = Math.max($header.length > 0 ? $header.height() : 0, parseInt(this.$margin.css('margin-top'))),
                bottomHeight = Math.max($footer.length > 0 ? $footer.height() : 0, parseInt(this.$margin.css('margin-top')));

            return this.height() - topHeight - bottomHeight;
        };

        /**
         * Determines if this page needs a break :)
         * @returns {boolean} Will the page take a break?
         */
        $page.needsBreaking = function needsBreaking() {
            return this.$content.height() > this.getContentHeight();
        };

        /**
         * Appends the header depending on the conditions in the paginator options.
         */
        $page.conditionallyAppendHeader = function conditionallyAppendHeader() {
            var $header;

            $header = $paginator.$$model.find('.header');

            if ($header.length > 0) {
                $header = $header.eq($header.length > 1 ? (($paginator._lastPageNumber) % $header.length) : 0).clone(true, true);

                if ($header.hasClass('terminal') && $paginator._lastPageNumber !== 1) {
                    return;
                }

                $header.children().wrapAll('<div class="margin">');

                this.append($header);
                setTimeout(function () {
                    $page.$content.css('margin-top', $header.height());
                });
            }
        };

        /**
         * Appends the footer depending on the conditions in the paginator options.
         */
        $page.conditionallyAppendFooter = function conditionallyAppendFooter() {
            var $footer;

            $footer = $paginator.$$model.find('.footer');

            if ($footer.length > 0) {
                $footer = $footer.eq($footer.length > 1 ? (($paginator._lastPageNumber) % $footer.length) : 0).clone(true, true);

                if ($footer.hasClass('terminal') && $paginator._lastPageNumber !== 1) {
                    return;
                }

                $footer.children().wrapAll('<div class="margin">');

                this.append($footer);
                setTimeout(function () {
                    $page.$content.css('margin-bottom', $footer.height());
                });
            }
        };

        /**
         * Determines if the page is blank
         * @returns {boolean} Is the page blank?
         */
        $page.isBlank = function isBlank() {
            return this.$margin.children().length < 1;
        };

        //
        // Set up the pages.
        //

        $page.data('pageNumber', pageNumber);
        $page.addClass('page');
        $page.$content.addClass('content');
        $page.$margin.addClass('margin');
        $page.$content.append($page.$margin);

        $page.conditionallyAppendHeader($paginator);
        $page.conditionallyAppendFooter($paginator);
        $page.append($page.$content);

        return $page;
    }
})();
