const CHOICES = ["rock", "paper", "scissors"];

function register(voxaApp) {
  voxaApp.onIntent("LaunchIntent", () => {
    return {
      flow: "continue",
      reply: "Welcome",
      to: "askHowManyWins",
    };
  });

  voxaApp.onIntent("HelpIntent", () => {
    return {
      flow: "yield",
      reply: "Help",
      to: 'entry',
    };
  });

  voxaApp.onIntent("FallbackIntent", () => {
    return {
      flow: "terminate",
      reply: "Fallback",
      to: 'entry',
    };
  });

  voxaApp.onIntent("SayScoreIntent", voxaEvent => {
    if ("userWins" in voxaEvent.model && "alexaWins" in voxaEvent.model) {
      return {
        flow: "continue",
        reply: "CurrentScore",
        to: "askIfContinueGame",
      };
    } else {
      return {
        flow: "continue",
        reply: "NoScoreAvailable",
        to: "askIfStartANewGame",
      };
    }
  });

  voxaApp.onIntent("NewGameIntent", voxaEvent => {
    if ("userWins" in voxaEvent.model && "alexaWins" in voxaEvent.model) {
      return {
        flow: "continue",
        reply: "CurrentScore",
        to: "askConfirmIfStartANewGame",
      };
    } else {
      return {
        flow: "continue",
        reply: "NoScoreAvailable",
        to: "askConfirmIfStartANewGame",
      };
    }
  });

  voxaApp.onState("askConfirmIfStartANewGame", voxaEvent => {
    if ("userWins" in voxaEvent.model && "alexaWins" in voxaEvent.model) {
      return {
        flow: "yield",
        reply: "AskConfirmIfStartANewGame",
        to: "shouldStartANewGameOrContinue",
      };
    } else {
      return {
        flow: "yield",
        reply: "AskConfirmIfStartANewGame",
        to: "shouldStartANewGame",
      };
    }
  });

  voxaApp.onState("shouldStartANewGameOrContinue", voxaEvent => {
    if (voxaEvent.intent.name === "YesIntent") {
      return {
        flow: "continue",
        reply: "RestartGame",
        to: "askHowManyWins",
      };
    }

    if (voxaEvent.intent.name === "NoIntent") {
      return {
        flow: "continue",
        reply: "Ok",
        to: "askUserChoice",
      };
    }
  });

  voxaApp.onState("askIfContinueGame", () => {
    return {
      flow: "yield",
      reply: "AskIfContinueGame",
      to: "shouldContinueGame",
    };
  });

  voxaApp.onState("shouldChangeWinsSet", voxaEvent => {
    if (voxaEvent.intent.name === "YesIntent") {
      return {
        flow: "continue",
        reply: "StartGame",
        to: "askUserChoice",
      };
    }

    if (voxaEvent.intent.name === "NoIntent") {
      return {
        flow: "continue",
        reply: "Ok",
        to: "askHowManyWins",
      };
    }
  });

  voxaApp.onState("shouldContinueGame", voxaEvent => {
    if (voxaEvent.intent.name === "YesIntent") {
      return {
        flow: "continue",
        reply: "Ok",
        to: "askUserChoice",
      };
    }
    if (voxaEvent.intent.name === "NoIntent") {
      return {
        flow: "continue",
        reply: "Ok",
        to: "askIfStartANewGame",
      };
    }
  });

  voxaApp.onState("askHowManyWins", () => {
    return {
      flow: "yield",
      reply: "AskHowManyWins",
      to: "getHowManyWins",
    };
  });

  voxaApp.onState("getHowManyWins", voxaEvent => {
    if (voxaEvent.intent.name === "MaxWinsIntent") {
      voxaEvent.model.wins = voxaEvent.intent.params.wins;
      voxaEvent.model.userWins = 0;
      voxaEvent.model.alexaWins = 0;
      if (voxaEvent.model.wins > 10) {
        return {
          flow: "yield",
          reply: "AskHowManyWinsBigNumber",
          to: "shouldChangeWinsSet",
        };
      }
      return {
        flow: "continue",
        reply: "StartGame",
        to: "askUserChoice",
      };
    }
  });

  voxaApp.onState("askUserChoice", voxaEvent => {
    const userWon =
      parseInt(voxaEvent.model.userWins) >= parseInt(voxaEvent.model.wins);
    const alexaWon =
      parseInt(voxaEvent.model.alexaWins) >= parseInt(voxaEvent.model.wins);

    if (userWon) {
      return {
        flow: "continue",
        reply: "UserWinsTheGame",
        to: "askIfStartANewGame",
      };
    }

    if (alexaWon) {
      return {
        flow: "continue",
        reply: "AlexaWinsTheGame",
        to: "askIfStartANewGame",
      };
    }

    const min = 0;
    const max = CHOICES.length - 1;
    voxaEvent.model.userChoice = undefined;
    voxaEvent.model.alexaChoice =
      Math.floor(Math.random() * (max - min + 1)) + min;

    return {
      flow: "yield",
      reply: "AskUserChoice",
      to: "getUserChoice",
    };
  });

  voxaApp.onState("getUserChoice", voxaEvent => {
    if (voxaEvent.intent.name === "RockIntent") {
      voxaEvent.model.userChoice = "rock";
    } else if (voxaEvent.intent.name === "PaperIntent") {
      voxaEvent.model.userChoice = "paper";
    } else if (voxaEvent.intent.name === "ScissorsIntent") {
      voxaEvent.model.userChoice = "scissors";
    }

    if (voxaEvent.model.userChoice) {
      return {
        flow: "continue",
        to: "processWinner",
      };
    }
  });

  voxaApp.onState("processWinner", voxaEvent => {
    const alexaChoice = CHOICES[voxaEvent.model.alexaChoice];
    const { userChoice } = voxaEvent.model;
    let reply = "TiedResult";

    if (alexaChoice === userChoice) {
      return {
        flow: "continue",
        reply,
        to: "askUserChoice",
      };
    }

    if (alexaChoice === "rock") {
      if (userChoice === "paper") {
        voxaEvent.model.userWins += 1;
        reply = "UserWins";
      }

      if (userChoice === "scissors") {
        voxaEvent.model.alexaWins += 1;
        reply = "AlexaWins";
      }
    }

    if (alexaChoice === "paper") {
      if (userChoice === "scissors") {
        voxaEvent.model.userWins += 1;
        reply = "UserWins";
      }

      if (userChoice === "rock") {
        voxaEvent.model.alexaWins += 1;
        reply = "AlexaWins";
      }
    }

    if (alexaChoice === "scissors") {
      if (userChoice === "rock") {
        voxaEvent.model.userWins += 1;
        reply = "UserWins";
      }

      if (userChoice === "paper") {
        voxaEvent.model.alexaWins += 1;
        reply = "AlexaWins";
      }
    }

    return {
      flow: "continue",
      reply,
      to: "askUserChoice",
    };
  });

  voxaApp.onState("askIfStartANewGame", () => {
    return {
      flow: "yield",
      reply: "AskIfStartANewGame",
      to: "shouldStartANewGame",
    };
  });

  voxaApp.onState("shouldStartANewGame", voxaEvent => {
    if (voxaEvent.intent.name === "YesIntent") {
      return {
        flow: "continue",
        reply: "RestartGame",
        to: "askHowManyWins",
      };
    }

    if (voxaEvent.intent.name === "NoIntent") {
      return {
        flow: "terminate",
        reply: "Bye",
      };
    }
  });

  voxaApp.onIntent("CancelIntent", () => {
    return {
      flow: "terminate",
      reply: "Bye",
    };
  });

  voxaApp.onIntent("StopIntent", () => {
    return {
      flow: "terminate",
      reply: "Bye",
    };
  });
}

module.exports = register;
