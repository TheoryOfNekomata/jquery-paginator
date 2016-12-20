(function () {
    var $paginationEl;

    $paginationEl = $('#pagination');

    $paginationEl.paginate();

    $paginationEl.on('paginator.modelchange', function (e) {
        console.log(e);
    });
})();
