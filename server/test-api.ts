async function run(){
  try{
    const res = await fetch('http://localhost:5000/api/flights/search?origin=1&destination=2');
    console.log('status', res.status);
    const text = await res.text();
    console.log('body:', text.slice(0, 1000));
  }catch(e){
    console.error('error', e);
  }
}
run();
