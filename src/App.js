import './App.css';
import { useState, useEffect } from 'react';
import Login from './components/Login';

function App() {
  const hash = window.location.hash
    .substring(1)
    .split("&")
    .reduce(function (initial, item) {
      if (item) {
        var parts = item.split("=");
        initial[parts[0]] = decodeURIComponent(parts[1]);
      }
      return initial;
    }, {});

  const generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  const [token] = useState(hash.access_token)
  const [state, setState] = useState(localStorage.getItem("state"))
  const [items, setItems] = useState(null)

  useEffect(() => {
    if (!state) {
      let _state = generateRandomString(16)
      setState(_state)
      localStorage.setItem('state', _state)
    }
  }, [state])

  const getItems = () => {
    console.log("fetching items")
    const data = { limit: 10, time_range: "long_term" }
    const url = `https://api.spotify.com/v1/me/top/tracks?time_range=${encodeURIComponent(data.time_range)}&limit=${encodeURIComponent(data.limit)}`
    fetch(url, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token
      },
    }).then(res => {
      if (res.status === 200) {
        res.json().then(res => setItems(res.items))
      } else if (res.status === 429) {
        const retry_after = res.headers['Retry-After'] + 1
        setTimeout(getItems(), retry_after * 1000);
        console.log("RATE LIMITED", res.status, retry_after)
      } else if (res.status === 401) {
        console.log("ERROR AUTH", res.status)
      }
    })
  }

  useEffect(() => {
    if (token) {
      getItems()
    }
  }, [token])

  return (
    <div className="App">
      {!token && (
        <Login state={state}/>
      )}
      {items && (
        items.map((item, i) => (
          <h1 key={i}>{item.name}</h1>
        )
        ))}
    </div>
  );
}

export default App;
