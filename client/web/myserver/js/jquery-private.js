// this is to avoid $ in global namespace..
define(['jquery'], function (jq) {
    return jq.noConflict( true );
}); 