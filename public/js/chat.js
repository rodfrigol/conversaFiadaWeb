function scrollDown(id) {
    var el = document.getElementById(id);
    el.scrollTop = el.scrollHeight;
}

$(document).ready(function() {
    var socket = io.connect();

    $(".participant").each(function() {
        $(this).click(function(e) {
            var selected = $(".selected")[0]
            if (!($.contains(selected, e.target) || selected == e.target)){
                $(".selected").removeClass("selected");
                $(this).addClass("selected");
                var sala = $(this).find(".name").text();
                sala = sala.replaceAll(' ', '').replace(/\n/g,'');
                socket.emit("entrar sala", sala);

                document.getElementById("chat-message-list").innerHTML = ""

                document.getElementById("chat-title").textContent = this.children[1].innerText

                $.get('message/get?chat_id=' + $('.selected').attr('value'), (data) => {
                    document.getElementById("chat-message-list").innerHTML = data
                    document.getElementById(
                        "chat-message-list"
                    ).scrollTop = document.getElementById("chat-message-list").scrollHeight;
                })
            }
        });
    });

    $("#chat-form").submit(function(e) {
        e.preventDefault();

        var mensagem = $("#message-input").val();

        if (mensagem.length == 0) {
            return;
        }

        var data = {
            chat_id: $('.selected').attr('value'),
            message: $("#message-input").val()
        }

        $.post('/message/send', data, (res) => {
            var dados = JSON.parse(res)

            socket.emit("enviar mensagem", dados, function() {
                $("#message-input").val("");
            });
            
            var mensagem_formatada = '<div class="message-row you-message"><div class="message-content"><div class="message-text">' + dados.message + '</div><div class="message-time">' + new Date(dados.date).toLocaleString() + '</div></div></div>'   

            $("#chat-message-list").append(mensagem_formatada);
            document.getElementById(
                "chat-message-list"
            ).scrollTop = document.getElementById("chat-message-list").scrollHeight;
        })
    });

    socket.on("atualizar mensagens", function(dados) {
        var mensagem_formatada = '<div class="message-row other-message"><div class="message-content"><span>'+dados.name+'</span><img src="./images/default.png"/><div class="message-text">' + dados.message + '</div><div class="message-time">' + new Date(dados.date).toLocaleString() + '</div></div></div>'

        $("#chat-message-list").append(mensagem_formatada);
        var el = document.getElementById("chat-message-list");
        el.scrollTop = el.scrollHeight;
    });

    scrollDown("chat-message-list");
});