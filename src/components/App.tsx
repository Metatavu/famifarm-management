import * as React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import WelcomePage from "../containers/WelcomePage";

class App extends React.Component {
  public render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Route exact path="/" component={WelcomePage} />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;



