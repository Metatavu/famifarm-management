import * as React from "react";
import { BrowserRouter } from "react-router-dom";
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
          <WelcomePage />
          <ConnectionStatus />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;



