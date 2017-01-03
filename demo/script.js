(function () {
    var $paginationEl;

    $paginationEl = $('#pagination');

    $paginationEl.paginate();

    $paginationEl.on('paginator.modelchangeend', function (e) {
        console.log(e);
    });
})();
