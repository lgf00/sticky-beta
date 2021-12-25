import "../stylesheets/Login.css";

function Login(props) {
    const authEndpoint = "https://accounts.spotify.com/authorize";
    const clientId = "3bebcbc76113406eadcaeb5051d437ad";
    //dev: "http://localhost:3000/sticky-beta/"
    //live: "https://lgf00.github.io/sticky-beta/"
    const redirectUri = "https://lgf00.github.io/sticky-beta/"; 
    const scopes = [
      "user-read-private",
      "user-read-email",
      "user-top-read",
    ];
    const state = props.state
    const query = `?response_type=token&client_id=${clientId}&scope=${scopes.join("%20")}&redirect_uri=${redirectUri}&state=${state}`
    return (
        <>
            <p>{props.errorMessage}</p>
            <a href={`${authEndpoint}${query}`}>
                Connect Your Spotify
            </a>
        </>
    )
}

export default Login;