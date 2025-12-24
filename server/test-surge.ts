async function run(){
  const url = 'http://localhost:5000/api/bookings';
  for(let i=1;i<=4;i++){
    try{
      const res = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({flightId:14641,seatNumber:`12A`,passengerName:`Guest ${i}`})});
      const json = await res.json();
      console.log(i, res.status, json.finalPrice ?? json.totalPrice, 'surge?', json.surgePriceApplied);
    }catch(e){
      console.error('err', e);
    }
  }
}
run();
