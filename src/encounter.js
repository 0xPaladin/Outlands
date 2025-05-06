import { Chance, _ } from "./helper.js";

const prng = new Chance();

const Reward = (R, h) => {
    let { game } = window.App;
    let { _safetyMod, _people, _hazards, factions, nc } = R;
    let { _terrain, site = {}, _feature = {} } = h;
    let pts = 3;
    let route = "";
    let extra = '';

    if (_terrain == "settlement") {
        //points 
        pts = 3 + site.scale;
        //routes
        let added = false
        site.routes.forEach(r => {
            let _added = game.addRoute(R.seed + r);
            added = added || _added;
        })
        route = added;
    } else if (_terrain == "dungeon") {
        //points 
        pts = 10;
        extra = `You've explored the ${h.name}... it was rewarding.`
    } else if (site) {
        if (site.what == "dungeon") {
            //points 
            pts = 10;
            extra = `You've found a ${site.text}... its exploration was rewarding.`
        } else if (site.outpost) {
            pts = 5;
            extra = `You've found a ${site.text}.`
        } else if (site.landmark) {
            pts = 5;
            extra = `You've found a ${site.text}.`
            //route 
            route = game.addRoute(R.seed + site.landmark.route);
        } else if (site.resource) {
            pts = 12;
            extra = `You've found a ${site.text}.`
        }
    }

    return {
        pts,
        route,
        extra
    }
}

const BanditGroups = 'bandits,criminal,revolutionary';

const EncounterText = {
    "people": (what, people, pass) => {
        let isBandit = BanditGroups.includes(what.type);
        let hrs = pass ? 0 : isBandit ? 6 : 2;
        let pts = pass ? 1 + (isBandit ? 4 : 0) : isBandit ? -3 : 0;

        let _base = people != null ? people.short : '';
        _base = what.what == "faction" ? `members from the local ${what.type} faction` : `a group of local ${_base == '' ? '' : _base + ' '}${what.type}`
        let text = `You've encountered ${_base}.`
        if (hrs > 0 && isBandit) {
            text += ` They roughed you up and took some of your things. You lost ${Math.abs(pts)} points and ${hrs} hours.`
        } else if (hrs > 0) {
            text += ` You lost ${hrs} hours to their questions.`
        } else if (pts > 0) {
            text += isBandit ? ` You got the drop on the rogues and managed sto steal some of their loot.` : ` You swaped stories and some trinkets with them.`
        }

        return {
            hrs,
            pts,
            text
        }
    }
    ,
    "creature": (what, pass) => {
        let attitude = pass ? prng.pickone(["inquisitive", "docile"]) : prng.pickone(["predatory", "angry"]);
        let text = `You encounter a ${attitude} ${what.short}.`
        let hrs = pass ? 0 : 6;

        const failText = {
            'a': ` You have to give it a wide berth and you lose ${hrs} hours.`,
            'b': ` You escape, barely. You have to spend ${hrs} hours treating some minor wounds.`
        }
        text += pass ? '' : failText[prng.pickone(Object.keys(failText))];

        return {
            text,
            hrs,
            pts: pass ? 1 : 0
        }
    }
    ,
    "obstacle": (what, pass) => {
        //obstacles don't hurt, they take more time 
        let hrs = pass ? 2 : 6;
        let text = `You've come across ${what.type} and have to navigate it. Its taken you an extra ${hrs} hours.`
        return {
            text,
            hrs,
            pts: pass ? 2 : 0
        };
    }
    ,
    "hazard": (what, pass) => {
        //hazards can hurt TBD
        let hrs = pass ? 0 : 6;
        let text = `You've encountered ${what.text}`
        text += pass ? `, but you managed to avoid it unscathed.` : `. You made it past, but you have to spend ${hrs} hours tending your wounds.`
        return {
            text,
            hrs,
            pts: pass ? 1 : 0
        };
    }
    ,
}

/*
    Notify 
*/
const Notify = (text) => {
    App.alert({
        html: `<div class="f3">${text}</div>`,
    })
}

/*
    Generate encounter 
*/
export const Encounter = (R, h) => {
    let { game } = window.App;
    let { _safetyMod, _people, _hazards, factions, _creatures, nc } = R;
    let { _terrain, site = null } = h;
    let _what = prng.DicePick("creature,hazard,site,faction,people/4,7,11,12", prng.d12() + _safetyMod);
    _what = _terrain == "settlement" ? prng.WS('people,faction/3,1') : _what;

    let res = {};

    let _encounter = {
        creature: (what = null) => {
            let pass = prng.d4() == 1;
            //creature encountered 
            what = what || (nc > 0 && prng.bool() ? prng.pickone(_creatures.slice(0, nc)) : prng.pickone(_creatures));
            //determine text based upon pass or not 
            res = EncounterText.creature(what, pass);
            //id of creature
            let _id = what.seed.slice(17);
            //check if seen before - if not gain points 
            if (!game.known.includes(_id)) {
                game.known.push(_id);
                res.text += ` You write a few notes about it in your journal.`
                res.pts += 2;
            }
        }
        ,
        hazard: () => {
            let pass = prng.bool();
            let what = _hazards.filter(hz => hz._terrain == 'any' || hz._terrain.includes(_terrain));
            //if no hazard exists 
            what = what.length == 0 ? {
                what: "obstacle",
                type: "rough terrain"
            } : prng.pickone(what);
            //build text and base time/pts 
            res = EncounterText[what.what](what, pass)
        }
        ,
        site: () => {
            let pass = prng.bool();
            let type = prng.weighted(["bandits", "explorers", "guards", "merchants", "prospectors", "hunters"], [2, 1, 1, 1, 1, 1]);
            res = EncounterText.people({
                type
            }, null, pass);
        }
        ,
        faction: () => {
            let pass = prng.d4() > 1;
            if (factions.length == 0) {
                return _encounter.people();
            }
            let _f = prng.pickone(factions);
            _f.what == 'faction' ? res = EncounterText.people(_f, null, pass) : _encounter.creature(_f);
        }
        ,
        people: () => {
            let pass = prng.d4() > 1;
            let people = _people.length > 1 ? (prng.bool() ? _people[0] : prng.pickone(_people.slice(1))) : _people[0];
            let type = prng.WS('farmers,laborers/1,1')
            let _faction = factions.length == 0 || prng.bool() ? {
                type
            } : prng.pickone(factions);

            res = EncounterText.people(_faction, people, pass);
        }
    };
    _encounter[_what]();

    //determine Reward
    let { pts, route, extra } = Reward(R, h);
    pts += res.pts;

    //text 
    res.text += extra.length > 0 ? " " + extra : '';
    res.text += pts > 0 ? ` You earned ${pts} points` : ``;
    res.text += route ? ` and learned of a new route.` : pts == 0 ? '' : '.';

    //mod game 
    game.points += pts;
    game.addTime(res.hrs);
    //notify of result 
    Notify(res.text);
}
