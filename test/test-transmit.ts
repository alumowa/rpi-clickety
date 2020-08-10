import Transmitter from '../src/Transmitter';

const r = new Transmitter(17);
let on: boolean = false;

setInterval(() => {

  on = !on;

  if(on){
    r.transmitRaw('AAAAjAAAAnYAAACRAAACcQAAAJEAAAJxAAACFwAAAPoAAACMAAACcQAAAhcAAADwAAAAkQAAAnEAAAIXAAAA+gAAAIcAAAJ2AAACEgAAAPUAAAISAAAA9QAAAhIAAAD1AAAAjAAAAnEAAAIXAAAA+gAAAIcAAAKFAAACAwAAAPUAAACMAAACgAAAAIcAAAJxAAAAlgAAAnYAAACHAAACewAAAhIAAAD1AAACDQAAAPoAAACMAAACdgAAAIwAAAJ7AAAAjAAAF5M=');
  }else{
    r.transmitRaw('AAAAlgAAAnEAAACWAAACbAAAAJsAAAJsAAACHAAAAPAAAACRAAACbAAAAhwAAADrAAAAlgAAAnYAAAIXAAAA6wAAAJsAAAJnAAACHAAAAOsAAAIcAAAA8AAAAhcAAADwAAAAkQAAAnYAAAISAAAA8AAAAJYAAAJsAAACHAAAAPUAAACMAAACdgAAAJEAAAJxAAAAlgAAAmwAAACWAAACcQAAAJYAAAJyAAAAlQAAAnEAAAISAAAA9QAAAhcAAADrAAAAlgAAF4k=');
  }
}, 2000);