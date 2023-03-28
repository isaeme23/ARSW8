package edu.eci.arsw.collabpaint.controller;

import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;

    /* Para evitar condiciones de carrera, usamos un ConcurrentHashMap. Asi evitamos que lleguen
    * dos veces un poligono y se sobreescriba. Tambien usamos un CopyOnWriteArrayList para
    * que los puntos que se van a almacenar en el no se sobreescriban */
    ConcurrentHashMap<Integer, CopyOnWriteArrayList<Point>> poligono = new ConcurrentHashMap<>();

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:"+pt);
        int guide = Integer.parseInt(numdibujo);
        if (poligono.get(guide) == null){
            poligono.put(guide, new CopyOnWriteArrayList<>());
            poligono.get(guide).add(pt);
        } else if (poligono.get(guide).size() == 3){
            poligono.get(guide).add(pt);
            msgt.convertAndSend("/topic/newpolygon."+numdibujo, poligono.get(guide));
            poligono.remove(guide);
        } else if (poligono.get(guide).size() < 3){
            poligono.get(guide).add(pt);
        }
        msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);
    }

}