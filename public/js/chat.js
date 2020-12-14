function scrollDown(id) {
    var el = document.getElementById(id);
    el.scrollTop = el.scrollHeight;
}

function rightArrowClick(){
    arrowClick(1)
}

function leftArrowClick(){
    arrowClick(-1)
}

function enterChat(e){
    $.ajax({
        url: '/chat/enter',
        type: 'post',
        data: {data:e.getAttribute('value')},
        dataType: 'json',
        success: function (data) {
            if (data.length === 0){
                alert("Successfully joined the chat")
                window.location.reload()
            }else{
                alert(data[0])
            }
        }
    });
}

function arrowClick(side){
    $.ajax({
        url: '/users/changeicon',
        type: 'post',
        data: {data:side},
        dataType: 'json',
        success: function (data) {
            $("#iconimg").attr("src","/images/"+data+".png");
            $("#iconimg").attr("alt",data);
        }
    });
}

$(window).ready(function() {
    var socket = io.connect();

    var list = $(".participant").map(function(){return $(this).attr("value");}).get();
    socket.emit("entrar sala", list);

    function changeChatToElem(el){
        $(".selected").removeClass("selected");
        $(el).addClass("selected");

        /*var sala = $(el).find(".name").text();
        sala = sala.replaceAll(' ', '').replace(/\n/g,'');
        socket.emit("entrar sala", sala);*/

        document.getElementById("chat-message-list").innerHTML = ""

        $("#chat-title > span").text(el.children[1].innerText)

        $.get('message/get?chat_id=' + $('.selected').attr('value'), (data) => {
            data = JSON.parse(data)
            
            var html = ''

            for (var i=0; i<data.length; i++){
                if (data[i].is_self){
                    html += '<div class="message-row you-message"><div class="message-content"><div class="message-text">' + data[i].content + '</div><div class="message-time">' + data[i].date.toLocaleString() + '</div></div></div>'
                }else{
                    html += '<div class="message-row other-message"><div class="message-content"><span>'+data[i].author+'</span><img src="./images/'+data[i].icon+'.png"/><div class="message-text">' + data[i].content + '</div><div class="message-time">' + data[i].date.toLocaleString() + '</div></div></div>'
                }
            }

            document.getElementById("chat-message-list").innerHTML = html
            scrollDown("chat-message-list")
        })
    }
    
    function changeChat(e){
        var selected = $(".selected")[0]
        if (!($.contains(selected, e.target) || selected == e.target)){
            changeChatToElem(this)
        }
    }

    $(".participant").each(function() {
        $(this).click(changeChat);
    });

    $("#chat-form").submit(function(e) {
        e.preventDefault();

        var mensagem = $("#message-input").val();

        if (mensagem.length == 0) {
            return;
        }

        var data = {
            chat_id: $('.selected').attr('value'),
            message: mensagem
        }

        $.post('/message/send', data, (res) => {
            var dados = JSON.parse(res)

            socket.emit("enviar mensagem", dados, function() {
                $("#message-input").val("");
            });
            
            var mensagem_formatada = '<div class="message-row you-message"><div class="message-content"><div class="message-text">' + dados.message + '</div><div class="message-time">' + new Date(dados.date).toLocaleString() + '</div></div></div>'   
            
            $("#chat-message-list").append(mensagem_formatada);
            $(".selected > .created-date").text(new Date(dados.date).toTimeString().split(' ')[0].substring(0, 5))
            $(".selected > .conversation-message").text(dados.name + ': ' + dados.message)

            scrollDown("chat-message-list")
        })
    });
    
    socket.on("atualizar mensagens", function(dados) {
        $(".participant").each((i, el) => {
            if (el.getAttribute("value") === dados.chat_id){
                el.children[2].textContent = new Date(dados.date).toTimeString().split(' ')[0].substring(0, 5)
                el.children[3].textContent = dados.name + ': ' + dados.message
            }
        })
        if ($(".selected").attr("value") === dados.chat_id){
            var mensagem_formatada = '<div class="message-row other-message"><div class="message-content"><span>'+dados.name+'</span><img src="./images/'+dados.icon+'.png"/><div class="message-text">' + dados.message + '</div><div class="message-time">' + new Date(dados.date).toLocaleString() + '</div></div></div>'
            $("#chat-message-list").append(mensagem_formatada);
        }
        scrollDown("chat-message-list")
    });

    $("#goChat").click(()=>{
        $("#dashboard-container").hide()
        $("#chat-container").css("display", "grid");
        scrollDown("chat-message-list");
    })

    $("#goDashboard").click(()=>{
        $("#dashboard-container").show()
        $("#chat-container").hide()
    })

    $("#create-public-submit").click(()=>{
        var name = $("#create-public-input").val()
        if (name==''){
            alert("Insert a name")
        }
        $.ajax({
            url: '/chat/create',
            type: 'post',
            data: {data:name},
            dataType: 'json',
            success: function (data) {
                if (data.length === 0){
                    alert("Chat created successfully")
                    window.location.reload()
                }else{
                    alert(data[0])
                }
            }
        });
    })

    $("#create-pvts-submit").click(()=>{
        var name = $("#create-pvt-input").val()
        if (name==''){
            alert("Insert an email")
        }
        $.ajax({
            url: '/chat/create_pvt',
            type: 'post',
            data: {data:name},
            dataType: 'json',
            success: function (data) {
                if (data.errors.length === 0){
                    $("#dashboard-container").hide()
                    $("#chat-container").css("display", "grid");
                    scrollDown("chat-message-list");
                    if(data.info.new){
                        $(".selected").removeClass("selected");
                        var html = `<div class="participant selected" value = "${data.info.chat_id}">
                                        <img src="./images/${data.info.icon}.png"/>
                                        <div class="name">
                                            ${data.info.name}
                                        </div>
                                        <div class="created-date">
                                        </div>
                                        <div class="conversation-message">
                                        </div>
                                    </div>`
                        
                        var el = $(html)
                        el.click(changeChat)
                        $("#participants-list").append(el)
                        $("#chat-title > span").text(data.info.name)
                        document.getElementById("chat-message-list").innerHTML = ""
                    }else{
                        changeChatToElem($(".participant[value="+data.info.chat_id+"]")[0])
                    }
                }else{
                    alert(data.errors[0])
                }
            }
        });
    })
    $("#search-input").on("input focus", (e) => {
        $.ajax({
            url: '/chat/search',
            type: 'post',
            data: {data:e.target.value},
            dataType: 'json',
            success: function (data) {
                var html = ''

                data.forEach((chat)=>{
                    html += `<div id='chat' value='${chat._id}' onclick='enterChat(this)'>
                                    <div id='chat-name'>${chat.name}</div>
                                    <div id='chat-info'>
                                        <i class="fa fa-user" style="font-size: 20px;color: green;padding-right:5px"></i>
                                        <span style="font-size: 20px;">${chat.count}</span>
                                    </div>
                                </div>`
                })
                
                $("#chats")[0].innerHTML = html
            }
        })
    })

});