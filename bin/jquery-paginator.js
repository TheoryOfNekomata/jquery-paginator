(function () {
    function PaginatorOptions(rawOpts) {
        return rawOpts;
    }

    function PaginatorPage(opts) {
        var self = this,
            view;

        function createElement() {
            self.$el = self.$el || $('<div>');
        }

        self.mountTo = function mountTo(parent) {
            createElement();
            view = parent;
        };
    }

    function PaginatorRenderer(opts) {
        var self = this,
            model,
            view;

        self.mountTo = function mountTo(parent) {
            model = parent.model;
            view = parent.view;
        };

        self.render = function render() {
            console.log('rendering');
        };
    }

    function PaginatorModel(opts) {
        var self = this,
            paginator;

        function createElement() {
            self.$el = self.$el || $('<div>');
            if (!!self.$watch) {
                return;
            }
            self.$watch = self.$watch || $('<div>').addClass('watch');
            self.$el.append(self.$watch);
        }

        self.mountTo = function mountTo(parent) {
            createElement();
            paginator = parent;
            paginator.$el.append(self.$el);
        };
    }

    function PaginatorView(opts) {
        var self = this,
            paginator;

        function createElement() {
            self.$el = self.$el || $('<div>');
        }

        self.mountTo = function mountTo(parent) {
            createElement();
            paginator = parent;
            paginator.$el.append(self.$el);
        };
    }

    function Paginator(opts) {
        var self = this,
            modelObserver,
            pub;

        opts = new PaginatorOptions(opts);
        self.model = new PaginatorModel(opts);
        self.view = new PaginatorView(opts);
        self.renderer = new PaginatorRenderer(opts);
        modelObserver = new MutationObserver(render);

        function render() {
            self.renderer.render();
        }

        function bindToElement($el) {
            self.$el = $el;
        }

        function createModel() {
            self.model.mountTo(self);
        }

        function createView() {
            self.view.mountTo(self);
        }

        function createRenderer() {
            self.renderer.mountTo(self);
        }

        function observeModel() {
            modelObserver
                .observe(self.model.$watch[0], {
                    childList: true,
                    attributes: true,
                    characterData: true,
                    subtree: true
                });
        }

        pub = {
            refresh: function doRender() {
                render();
            }
        };

        self.bindTo = function bindTo($el) {
            bindToElement($el);
            createModel();
            createView();
            createRenderer();
            observeModel();
            $el.data('paginator', pub);
        };
    }

    $.fn.paginate = function paginate(opts) {
        new Paginator(opts).bindTo(this);
    };
})();

//# sourceMappingURL=jquery-paginator.js.map
