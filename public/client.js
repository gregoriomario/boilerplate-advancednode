$(document).ready(function () {
  // Form submittion with new message in field with id 'm'

  let socket = io();
  socket.on('user count', (data) => {
    console.log(data)
  })

  $('form').submit(function () {
    var messageToSend = $('#m').val();

    $('#m').val('');
    return false; // prevent form submit from refreshing page
  });
});
