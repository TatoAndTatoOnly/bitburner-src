import React, { useState, useEffect, useRef } from "react";

import { IPlayer } from "../PersonObjects/IPlayer";
import { IEngine } from "../IEngine";
import { ITerminal } from "../Terminal/ITerminal";
import { installAugmentations } from "../Augmentation/AugmentationHelpers";
import { saveObject } from "../SaveObject";
import { onExport } from "../ExportBonus";
import { LocationName } from "../Locations/data/LocationNames";
import { Faction } from "../Faction/Faction";
import { prestigeAugmentation } from "../Prestige";
import { dialogBoxCreate } from "../../utils/DialogBox";
import { AllServers } from "../Server/AllServers";
import { Factions } from "../Faction/Factions";
import { buyStock, sellStock, shortStock, sellShort } from "../StockMarket/BuyingAndSelling";
import {
  cancelOrder,
  eventEmitterForUiReset,
  initStockMarketFnForReact,
  placeOrder,
  StockMarket,
} from "../StockMarket/StockMarket";

import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import createStyles from "@mui/styles/createStyles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { Page, IRouter } from "./Router";
import { SidebarRoot } from "../Sidebar/ui/SidebarRoot";
import { AugmentationsRoot } from "../Augmentation/ui/AugmentationsRoot";
import { DevMenuRoot } from "../DevMenu";
import { BladeburnerRoot } from "../Bladeburner/ui/BladeburnerRoot";
import { GangRoot } from "../Gang/ui/GangRoot";
import { CorporationRoot } from "../Corporation/ui/CorporationRoot";
import { InfiltrationRoot } from "../Infiltration/ui/InfiltrationRoot";
import { ResleeveRoot } from "../PersonObjects/Resleeving/ui/ResleeveRoot";
import { WorkInProgressRoot } from "./WorkInProgressRoot";
import { GameOptionsRoot } from "../ui/React/GameOptionsRoot";
import { SleeveRoot } from "../PersonObjects/Sleeve/ui/SleeveRoot";
import { HacknetRoot } from "../Hacknet/ui/HacknetRoot";
import { LocationRoot } from "../Locations/ui/Root";
import { ProgramsRoot } from "../Programs/ui/ProgramsRoot";
import { Root as ScriptEditorRoot } from "../ScriptEditor/ui/Root";
import { MilestonesRoot } from "../Milestones/ui/MilestonesRoot";
import { TerminalRoot } from "../Terminal/ui/TerminalRoot";
import { TutorialRoot } from "../Tutorial/ui/TutorialRoot";
import { ActiveScriptsRoot } from "../ui/ActiveScripts/ActiveScriptsRoot";
import { FactionsRoot } from "../Faction/ui/FactionsRoot";
import { FactionRoot } from "../Faction/ui/FactionRoot";
import { CharacterInfo } from "./CharacterInfo";
import { TravelAgencyRoot } from "../Locations/ui/TravelAgencyRoot";
import { StockMarketRoot } from "../StockMarket/ui/StockMarketRoot";
import { BitverseRoot } from "../BitNode/ui/BitverseRoot";
import { CharacterOverview } from "./React/CharacterOverview";
import { BladeburnerCinematic } from "../Bladeburner/ui/BladeburnerCinematic";
import { workerScripts } from "../Netscript/WorkerScripts";

import { startHackingMission } from "../Faction/FactionHelpers";
import { enterBitNode } from "../RedPill";
import { Context } from "./Context";

interface IProps {
  terminal: ITerminal;
  player: IPlayer;
  engine: IEngine;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      "-ms-overflow-style": "none" /* for Internet Explorer, Edge */,
      "scrollbar-width": "none" /* for Firefox */,
      margin: theme.spacing(0),
    },
  }),
);

let filename = "";
let code = "";

export let Router: IRouter = {
  page: () => {
    throw new Error("Router called before initialization");
  },
  toActiveScripts: () => {
    throw new Error("Router called before initialization");
  },
  toAugmentations: () => {
    throw new Error("Router called before initialization");
  },
  toBitVerse: () => {
    throw new Error("Router called before initialization");
  },
  toBladeburner: () => {
    throw new Error("Router called before initialization");
  },
  toCharacterInfo: () => {
    throw new Error("Router called before initialization");
  },
  toCity: () => {
    throw new Error("Router called before initialization");
  },
  toCorporation: () => {
    throw new Error("Router called before initialization");
  },
  toCreateProgram: () => {
    throw new Error("Router called before initialization");
  },
  toDevMenu: () => {
    throw new Error("Router called before initialization");
  },
  toFaction: () => {
    throw new Error("Router called before initialization");
  },
  toFactions: () => {
    throw new Error("Router called before initialization");
  },
  toGameOptions: () => {
    throw new Error("Router called before initialization");
  },
  toGang: () => {
    throw new Error("Router called before initialization");
  },
  toHacknetNodes: () => {
    throw new Error("Router called before initialization");
  },
  toInfiltration: () => {
    throw new Error("Router called before initialization");
  },
  toJob: () => {
    throw new Error("Router called before initialization");
  },
  toMilestones: () => {
    throw new Error("Router called before initialization");
  },
  toResleeves: () => {
    throw new Error("Router called before initialization");
  },
  toScriptEditor: () => {
    throw new Error("Router called before initialization");
  },
  toSleeves: () => {
    throw new Error("Router called before initialization");
  },
  toStockMarket: () => {
    throw new Error("Router called before initialization");
  },
  toTerminal: () => {
    throw new Error("Router called before initialization");
  },
  toTravel: () => {
    throw new Error("Router called before initialization");
  },
  toTutorial: () => {
    throw new Error("Router called before initialization");
  },
  toWork: () => {
    throw new Error("Router called before initialization");
  },
  toBladeburnerCinematic: () => {
    throw new Error("Router called before initialization");
  },
};

function determineStartPage(player: IPlayer): Page {
  if (player.isWorking) return Page.Work;
  return Page.Terminal;
}

export function GameRoot({ player, engine, terminal }: IProps): React.ReactElement {
  const classes = useStyles();
  const contentRef = useRef<HTMLDivElement>(null);
  const [faction, setFaction] = useState<Faction | null>(
    player.currentWorkFactionName ? Factions[player.currentWorkFactionName] : null,
  );
  const [page, setPage] = useState(determineStartPage(player));

  const [flume, setFlume] = useState<boolean>(false);
  const [quick, setQuick] = useState<boolean>(false);
  const [location, setLocation] = useState<LocationName>(LocationName.Sector12);

  const [cinematicText, setCinematicText] = useState("");

  Router = {
    page: () => page,
    toActiveScripts: () => setPage(Page.ActiveScripts),
    toAugmentations: () => setPage(Page.Augmentations),
    toBladeburner: () => setPage(Page.Bladeburner),
    toCharacterInfo: () => setPage(Page.Stats),
    toCorporation: () => setPage(Page.Corporation),
    toCreateProgram: () => setPage(Page.CreateProgram),
    toDevMenu: () => setPage(Page.DevMenu),
    toFaction: (faction?: Faction) => {
      setPage(Page.Faction);
      if (faction) setFaction(faction);
    },
    toFactions: () => setPage(Page.Factions),
    toGameOptions: () => setPage(Page.Options),
    toGang: () => setPage(Page.Gang),
    toHacknetNodes: () => setPage(Page.Hacknet),
    toMilestones: () => setPage(Page.Milestones),
    toResleeves: () => setPage(Page.Resleeves),
    toScriptEditor: (fn: string, c: string) => {
      filename = fn;
      code = c;
      setPage(Page.CreateScript);
    },
    toSleeves: () => setPage(Page.Sleeves),
    toStockMarket: () => setPage(Page.StockMarket),
    toTerminal: () => setPage(Page.Terminal),
    toTutorial: () => setPage(Page.Tutorial),
    toJob: () => {
      player.gotoLocation(player.companyName as LocationName);
      setPage(Page.Job);
    },
    toCity: () => {
      // TODO This conversion is bad.
      player.gotoLocation(player.city as unknown as LocationName);
      setPage(Page.City);
    },
    toTravel: () => {
      player.gotoLocation(LocationName.TravelAgency);
      setPage(Page.Travel);
    },
    toBitVerse: (flume: boolean, quick: boolean) => {
      setFlume(flume);
      setQuick(quick);
      setPage(Page.BitVerse);
    },
    toInfiltration: (location: LocationName) => {
      setLocation(location);
      setPage(Page.Infiltration);
    },
    toWork: () => setPage(Page.Work),
    toBladeburnerCinematic: () => {
      setPage(Page.BladeburnerCinematic);
      setCinematicText(cinematicText);
    },
  };

  useEffect(() => {
    filename = "";
    code = "";
  });

  return (
    <Context.Player.Provider value={player}>
      <Context.Router.Provider value={Router}>
        <CharacterOverview save={() => saveObject.saveGame(engine.indexedDb)} />
        {page === Page.BitVerse ? (
          <BitverseRoot flume={flume} enter={enterBitNode} quick={quick} />
        ) : page === Page.Infiltration ? (
          <InfiltrationRoot location={location} />
        ) : page === Page.BladeburnerCinematic ? (
          <BladeburnerCinematic />
        ) : page === Page.Work ? (
          <WorkInProgressRoot />
        ) : (
          <Box display="flex" flexDirection="row" width="100%">
            <SidebarRoot player={player} router={Router} page={page} />
            <Box
              ref={contentRef}
              className={classes.root}
              flexGrow={1}
              display="block"
              width="100%"
              px={1}
              height="100vh"
            >
              {page === Page.Terminal ? (
                <TerminalRoot terminal={terminal} router={Router} player={player} />
              ) : page === Page.Sleeves ? (
                <SleeveRoot player={player} />
              ) : page === Page.Stats ? (
                <CharacterInfo player={player} />
              ) : page === Page.CreateScript ? (
                <ScriptEditorRoot filename={filename} code={code} player={player} router={Router} />
              ) : page === Page.ActiveScripts ? (
                <ActiveScriptsRoot workerScripts={workerScripts} />
              ) : page === Page.Hacknet ? (
                <HacknetRoot player={player} />
              ) : page === Page.CreateProgram ? (
                <ProgramsRoot />
              ) : page === Page.Factions ? (
                <FactionsRoot player={player} router={Router} />
              ) : page === Page.Faction ? (
                <FactionRoot faction={faction} startHackingMissionFn={startHackingMission} />
              ) : page === Page.Milestones ? (
                <MilestonesRoot player={player} />
              ) : page === Page.Tutorial ? (
                <TutorialRoot />
              ) : page === Page.DevMenu ? (
                <DevMenuRoot player={player} engine={engine} router={Router} />
              ) : page === Page.Gang ? (
                <GangRoot gang={player.gang} />
              ) : page === Page.Corporation ? (
                <CorporationRoot corp={player.corporation} player={player} />
              ) : page === Page.Bladeburner ? (
                <BladeburnerRoot bladeburner={player.bladeburner} />
              ) : page === Page.Resleeves ? (
                <ResleeveRoot player={player} />
              ) : page === Page.Travel ? (
                <TravelAgencyRoot p={player} router={Router} />
              ) : page === Page.StockMarket ? (
                <StockMarketRoot
                  buyStockLong={buyStock}
                  buyStockShort={shortStock}
                  cancelOrder={cancelOrder}
                  eventEmitterForReset={eventEmitterForUiReset}
                  initStockMarket={initStockMarketFnForReact}
                  p={player}
                  placeOrder={placeOrder}
                  sellStockLong={sellStock}
                  sellStockShort={sellShort}
                  stockMarket={StockMarket}
                />
              ) : page === Page.City ? (
                <LocationRoot initiallyInCity={true} engine={engine} p={player} router={Router} />
              ) : page === Page.Job ? (
                <LocationRoot initiallyInCity={false} engine={engine} p={player} router={Router} />
              ) : page === Page.Options ? (
                <GameOptionsRoot
                  player={player}
                  save={() => saveObject.saveGame(engine.indexedDb)}
                  delete={() => saveObject.deleteGame(engine.indexedDb)}
                  export={() => saveObject.exportGame()}
                  import={() => saveObject.importGame()}
                  forceKill={() => {
                    for (const hostname of Object.keys(AllServers)) {
                      AllServers[hostname].runningScripts = [];
                    }
                    dialogBoxCreate("Forcefully deleted all running scripts. Please save and refresh page.");
                  }}
                  softReset={() => {
                    dialogBoxCreate("Soft Reset!");
                    prestigeAugmentation();
                    Router.toTerminal();
                  }}
                />
              ) : page === Page.Augmentations ? (
                <AugmentationsRoot
                  exportGameFn={() => {
                    saveObject.exportGame();
                    onExport(player);
                  }}
                  installAugmentationsFn={() => {
                    installAugmentations();
                    Router.toTerminal();
                  }}
                />
              ) : (
                <>
                  <Typography>Cannot load</Typography>
                </>
              )}
            </Box>
          </Box>
        )}
      </Context.Router.Provider>
    </Context.Player.Provider>
  );
}