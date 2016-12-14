(function () {
    /**
     * Class for the paginator settings.
     * @param {Object} opts The settings hash
     * @returns {Object} The normalized paginator settings.
     * @constructor
     */
    Paginator.Settings = function Settings(opts) {
        var settings;

        settings = {
            //page: new Paginator.PageSettings(opts),
            component: new Paginator.ComponentSettings(opts)
        };

        return settings;
    };
})();
