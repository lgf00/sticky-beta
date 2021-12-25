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

  const [token, updateToken] = useState(hash.access_token)
  const [state, setState] = useState(localStorage.getItem("state"))
  const [recievedState] = useState(hash.state)
  const [items, setItems] = useState(null)
  const [error, setError] = useState(hash.error) 
  const [errorMessage, setErrorMessage] = useState(null)
  const [selected, updateSelected] = useState(["selected", "", ""])

  const getItems = (time_range) => {
    if (state === recievedState) {
      console.log("fetching items")
      const data = { limit: 10, time_range: time_range }
      const url = `https://api.spotify.com/v1/me/top/tracks?time_range=${encodeURIComponent(data.time_range)}&limit=${encodeURIComponent(data.limit)}`
      fetch(url, {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + token
        },
      }).then(res => {
        if (res.status === 200) {
          console.log(res.status)
          res.json().then(res => setItems(res.items))
        } else if (res.status === 429) {
          const retry_after = res.headers['Retry-After'] + 1
          setTimeout(getItems(), retry_after * 1000);
          console.log("RATE LIMITED", res.status, retry_after);
        } else if (res.status === 401) {
          console.log("ERROR AUTH", res.status);
          updateToken(null);
          setErrorMessage("Sorry, please reconnect your spotify account")
        }
      })
    } else {
      updateToken(null)
      setErrorMessage("There was an error fetching data (mismatched state), please reconnect your spotify")
    }
  }

  const tr_onClick = (time_range, s) => {
    if (selected[s] !== "selected") {
      getItems(time_range);
      let new_selected = ["", "", ""]
      new_selected[s] = "selected"
      updateSelected(new_selected)
    }
  }

  useEffect(() => {
    if (!state) {
      let temp = generateRandomString(16);
      setState(temp);
      localStorage.setItem('state', temp);
    }
  }, [state])

  useEffect(() => {
    if (state === recievedState) {
      if (token) {
        getItems("short_term");
        setErrorMessage(null);
        setError(null);
      }
    } else {
      if (token) {
        updateToken(null);
        setErrorMessage("There was an error fetching data (mismatched state), please reconnect your spotify");
      }
    }
  }, [token, recievedState, state])

  useEffect(() => {
    if (error) {
      setErrorMessage("There was an error connecting to spotify, please try again");
      updateToken(null)
    }
  }, [error])

  return (
    <div className="container2">
      <div className="header">
        <h1>sticky-beta</h1>
      </div>
      <div className="content">
        {!token && (
          <Login state={state} errorMessage={errorMessage}/>
        )}
        {token && items && (
          <>
            <div className='tr_buttons'>
              <button onClick={() => {tr_onClick("short_term", 0)}} className={selected[0] + ' tr_button'} >Last Month</button>
              <button onClick={() => {tr_onClick("medium_term", 1)}} className={selected[1] + ' tr_button'}>Last 6 Months</button>
              <button onClick={() => {tr_onClick("long_term", 2)}} className={selected[2] + ' tr_button'}>All Time</button>
            </div>
            <div className="generate">
              <div className="list">
              {items.map((item, i) => (
                <h1 key={i}>{i + 1 + ". " + item.name + " /" + item.artists.map((artist) => {
                  return(" " + artist.name)
                }) }</h1>
              ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
