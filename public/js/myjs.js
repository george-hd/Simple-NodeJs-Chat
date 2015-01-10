
var socket = io();
$('form').submit(function(){
    socket.emit('chat message', getCookieValue('username') + ' :' + $('#m').val());
    $('#m').val('');
    return false;
});
socket.on('chat message', function(msg){
    $('#messages').append($('<li>').text(msg));
});

$('#mess').animate({ scrollTop: 1000000 }, "slow");

socket.on('user-connected', function(rows){
    $('#users').html('');
    for(var row in rows){
        $('#users').append("<li id="+ rows[row]['userName'] +">" + rows[row]['userName'] + "</li>");
    }
});

function getCookieValue(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

$(window).on('beforeunload', function(){
    var cookie = getCookieValue('username');
    socket.emit('user-disconnected', cookie);
});

socket.on('person-leave', function(cookie){
    $('#'+cookie).remove();
});