import * as React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import WelcomePage from "./WelcomePage";
import ConnectionStatus from "./ConnectionStatus";

class App extends React.Component {

  /**
   * Render App component
   */
  public render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Route path="/" component={WelcomePage} />
          <ConnectionStatus />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;



