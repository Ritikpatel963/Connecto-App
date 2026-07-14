const url = "https://whypwqhdfxtjjenkhkwt.supabase.co/rest/v1/?apikey=sb_publishable_3tvF2hOnQ_slfiK4dVgzVw_oSnDZpnJ";
fetch(url)
  .then(res => res.json())
  .then(data => {
     console.log(JSON.stringify(data, null, 2));
  })
  .catch(console.error);
