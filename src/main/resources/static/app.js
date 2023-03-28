var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }

    var number;

    function saveNumber(){
         number = $("#number").val();
    }
    
    var stompClient = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("myCanvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("myCanvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        saveNumber();
        console.log(number);
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            saveNumber();
            stompClient.subscribe('/topic/newpoint.'+ number, function (eventbody) {
                var theObject=JSON.parse(eventbody.body);
                var p = new Point(theObject.x, theObject.y);
                //addPointToCanvas(p);
            });
        });
    };

    var publishPoints = function(pt){
        stompClient.send("/topic/newpoint."+ number, {}, JSON.stringify(pt));
    }

    var drawpoint = function(){
        var canvas = document.getElementById("myCanvas");
        var ctx = canvas.getContext("2d");
          if(window.PointerEvent) {
            canvas.addEventListener("pointerdown", function(event){
              var point = new Point(event.pageX, event.pageY);
              addPointToCanvas(point);
              publishPoints(point);
            }
            );
          }
          else {
            canvas.addEventListener("mousedown", function(event){
                var point = new Point(event.pageX, event.pageY);
                addPointToCanvas(point);
                publishPoints(point);
            }
            );
          }
    }



    return {

        init: function () {
            var can = document.getElementById("canvas");
            drawpoint();
            //connectAndSubscribe();
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        },

        connectAndSubscribe:connectAndSubscribe
    };

})();