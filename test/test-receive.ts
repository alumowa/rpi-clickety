import Receiver from '../src/Receiver';

let count = 0;

const r = new Receiver(27);

r.listenStart();
r.on('code', (code) => {

  console.log(`Got code ${JSON.stringify(code, null, 2)}`);

  if(count === 5){
    console.log('stopping');
    r.listenStop();
    return;
  }

  count++;
});
