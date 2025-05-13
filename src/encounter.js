import { SiteEncounters, DungeonEncounters } from "./encounter-site.js";

import { Chance, _ } from "./helper.js";

const prng = new Chance();

const Reward = (R, h) => {
    let { game } = window.App;
    let { _safetyMod, _people, _hazards, factions, nc } = R;
    let { _terrain, site = {}, _feature = {} } = h;
    let pts = 0;
    let route = "";
    let extra = '';

    if (_terrain == "settlement") {
        //points 
        pts = site.scale;
        //routes
        let added = false
        site.routes.forEach(r => {
            let _added = game.addRoute([R.seed, r].join("|"));
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
            route = game.addRoute([R.seed, site.landmark.route].join("|"));
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
        let pts = pass ? 1 + (isBandit ? 2 : 0) : 0;
        let coin = pass ? 5 + (isBandit ? 10 : 0) : isBandit ? -10 : 0;

        let _base = people != null ? people.short : '';
        _base = what.what == "faction" ? `members from the local ${what.type} faction` : `a group of local ${_base == '' ? '' : _base + ' '}${what.type || ''}`
        let text = `You've encountered ${_base}.`
        if (hrs > 0 && isBandit) {
            text += ` They roughed you up and took some of your things. You lost 10 coin and ${hrs} hours.`
        } else if (hrs > 0) {
            text += ` You lost ${hrs} hours to their questions.`
        } else if (pts > 0) {
            text += isBandit ? ` You got the drop on the rogues and managed to steal some of their loot - you got ${coin} coin.` : ` You swaped stories and some baubles with them, you got ${coin} coin.`
        }

        return {
            hrs,
            pts,
            coin,
            text
        }
    }
}

/*
    Dice Results
*/
const DiceResults = (check = []) => {
    //dice
    let dice = `<img src="src/assets/d10-outline.svg" width="40" height="40" />`
    let [_pass, pf, roll, skill, val] = check;
    return check.length == 0 ? `` : `
        <div class="flex justify-center">
            ${pf.map((r, i) => `
            <div class="relative">
                ${dice}
                <div class="absolute w-100 tc f3 b ${r ? 'green' : 'red'}" style="top:10%">${roll[i]}</div>
            </div>`).join("")}
        </div>`;
}

/*
    Generate encounter 
*/
export const Encounter = (R, h, isSearch) => {
    let { Swal } = window;
    let { game } = window.App;
    let { _safetyMod, _people, factions, _creatures, nc } = R;
    let { _terrain, _site = null, _feature } = h;
    //difficulty of skill check
    let diff = _feature ? _feature.diff : h.diff || 1;

    //determine what they faces 
    let _roll = prng.d12() + _safetyMod;
    let _what = prng.DicePick("creature,hazard,site,people,quiet/2,4,6,8", _roll);
    if (!isSearch) {
        _what == "site" ? 'people' : _what;
    }
    else if ('settlement,dungeon'.includes(_terrain) || (_site && _site.what == 'dungeon')) {
        _what = _site && _site.what == 'dungeon' ? 'dungeon' : _terrain;
    }
    else if (_site) {
        _what = 'local';
    }

    let pts = 0;
    let coin = 0;
    let route = false;
    let res = {};
    let check = null;

    const LocalResolve = () => {
        pts += (res.pts || 0) + (isSearch ? 3 : 0);
        coin += (res.coin || 0);

        //mod game 
        game.addPoints(pts);
        game.addTime(res.hrs);
        game._items.coin += coin;

        //text 
        res.text += res.extra ? " " + res.extra : '';
        res.text += pts > 0 ? ` You earned ${pts} points.` : ``;
        res.text += route ? ` You learned of a new route.` : ``;

        //notify of result 
        Swal.fire({
            title: _.capitalize(_what),
            html: `<div class="f3">${res.text}</div>${DiceResults(check || [])}`
        })

        //save
        game.save();
    }

    let _encounter = {
        settlement: () => {
            //points 
            pts = h.site.scale;
            //routes
            h.site.routes.forEach(r => {
                let _added = game.addRoute([R.seed, r].join("|"));
                route = route || _added;
            })

            //determine encounter
            _encounter.people();
        },
        creature: (what = null) => {
            //don't get a chance to interact with hazard - save is automatic 
            check = game.skillCheck(prng.WS('H,K,R/4,1,2'), diff);
            //creature encountered 
            what = what || (nc > 0 && prng.bool() ? prng.pickone(_creatures.slice(0, nc)) : prng.pickone(_creatures));
            //determine how to resolve 
            let _opts = [
                ['H: Face it head on and fight; +1 Trinket.', 'T1'],
                ['K: Look for a way to sneak around it; -2 hours.', 'H-2'],
                ['R: Try to outsmart and distract it; +1 Points.', 'P1']
            ];
            let opts = [
                [`A ${what.short} approaches...`, _opts.map(o => o[0]).join("/"), _opts.map(o => o[1]).join("/")],
                [`You are supprised by a ${what.short}...`, [_opts[0][0], _opts[2][0]].join('/'), [_opts[0][1], _opts[2][1]].join('/')],
                [`You sneak up on a ${what.short}...`, _opts.map(o => o[0]).join("/"), _opts.map(o => o[1]).join("/")],
            ]
            //select encounter
            let _enc = prng.pickone(opts);
            //check if seen before - if not gain points 
            let _id = what.seed.slice(17);
            if (!game.known.includes(_id)) {
                game.known.push(_id);
                game.addPoints(2);
                _enc.push(`You write a few notes about it in your journal.`)
            }
            //run encounter
            RunLoopEncounter(game, _enc, diff);
        }
        ,
        hazard: () => {
            //don't get a chance to interact with hazard - save is automatic 
            check = game.skillCheck(_feature.hazard.skill || "HKR", diff);
            res = _feature.hazard.enc(check[0]);
            res.text += res.hrs > 0 ? ` You lost ${res.hrs} hours.` : ''
            res.pts = check[0] ? 1 : 0;
            return LocalResolve()
        }
        ,
        site: () => {
            let _enc = prng.pickone(SiteEncounters)
            RunLoopEncounter(game, _enc, diff);
        }
        ,
        dungeon: () => {
            let _enc = prng.pickone(DungeonEncounters);
            _enc[0] = h.name + " - " + _enc[0];
            RunLoopEncounter(game, _enc, diff);
        },
        local: () => {
            //determine encounter
            let _enc = prng.pickone(SiteEncounters);

            if (_site.landmark) {
                _enc[2] += ',P5';
                _enc.push(`You've found a ${_site.text}.`);
                //route 
                route = game.addRoute([R.seed, _site.landmark.route].join("|"));
            } else if (_site.resource) {
                _enc[2] += ',P10';
                _enc.push(`You've found a ${_site.text}.`)
            }

            RunLoopEncounter(game, _enc, diff);
        },
        people: () => {
            //usually pass, no skill check
            let pass = prng.d4() > 1;
            //determine people 
            let people = _people.length > 1 ? (prng.bool() ? _people[0] : prng.pickone(_people.slice(1))) : _people[0];
            //determine faction
            let _factions = factions.filter(f => f.what == 'faction');
            let _faction = _factions.length == 0 || prng.bool() ? { type: prng.WS('farmers,laborers,hunters/1,1,1') } : prng.pickone(_factions);
            //determine text based upon pass or not
            res = EncounterText.people(_faction, people, pass);
            return LocalResolve();
        },
        quiet: () => {
            res = {
                text: "You've encountered nothing of note.",
                hrs: 0,
                pts: 0
            }
            return LocalResolve();
        }
    };
    console.log(_roll, _what);
    _encounter[_what]();
}

/*
    Resolve Encounter - Update Game and Notify
*/
const RewardIds = {
    C: "coin",
    H: "hours",
    P: "points",
    S: "supply",
    T: "trinkets",
    R: "relics",
    Q: "quest"
}

const Resolve = (game, title, check, reward) => {
    let { Swal } = window;
    //mod game 
    console.log(reward)
    let text = reward.reduce((txt, r) => {
        let [id, val] = [r.slice(0, 1), Number(r.slice(1))];
        //get reward id
        let _rid = RewardIds[id];
        //update game
        game.reward(_rid, val);
        //update text
        txt.push(`<span>${val} ${_rid}</span>`)
        return txt;
    }, [])
    //game.addTime(res.hrs);
    let html = `
    <div class="f3">${check.length == 0 || check[0] ? 'Success!' : 'Failure.'}</div>
    ${DiceResults(check)}`

    //Rewards 
    html += text.length > 0 ? `<div class="f3"><b>Reward:</b> ${text.join(', ')}.</div>` : '';
    //notify of result 
    Swal.fire({
        title,
        html
    });
    //save
    game.save();
}

/*    
    Loop Encounters
    example site : ['Explorer’s Campground', 'HR: +5 Coin, +1 Quest Item/KR: +1 Quest Item, +1 Trinkets', 'C5,Q1/Q1,T1']
*/

const RunLoopEncounter = async (game, enc, diff) => {
    let { Swal } = window;
    let [title, options, reward, text = ''] = [enc[0], enc[1].split("/"), enc[2].split("/")];
    console.log(enc);

    let html = `
    <div class="f3">Difficulty ${diff}${diff > 1 ? `; ${diff}x the coin & trinket reward.` : ''}</div>
    <div class="f3">${text}</div>`;
    //fire swal
    const { value: action } = await Swal.fire({
        title,
        html,
        input: "select",
        inputOptions: Object.fromEntries(options.map((o, i) => [i, o])),
        inputPlaceholder: "Select an action",
    })
    if (action) {
        //get skill and check 
        let _skill = options[Number(action)].split(":")[0];
        _skill == 'Any' ? _skill = 'HKR' : null;
        let check = _skill == "Free" ? [] : game.skillCheck(_skill, diff);
        //increase reward based upon diff 
        let _reward = reward[Number(action)].split(",").map(r => {
            let [rid, val] = [r.slice(0, 1), Number(r.slice(1))];
            return 'CT'.includes(rid) ? rid + (val * diff) : r;
        });

        if (_skill == "Free" || check[0]) {
            //successful check
            _reward.push("P4");
            Resolve(game, title, check, _reward);
        }
        else if (game.stamina[0] > 0) {
            //failed check
            ReRoll(game, title, check, _reward);
        }
        else {
            //failed check
            Resolve(game, title, check, ["P3"]);
        }
    }
}

const ReRoll = (game, title, check, reward) => {
    let _title = title;
    let html = `
    <div class="f3">You failed the check.</div>
    ${DiceResults(check)}
    <div class="f3">A reroll costs 1 Stamina.</div>`
    //fire swal
    Swal.fire({
        title: `${title} ReRoll?`,
        html,
        showCancelButton: true,
        confirmButtonText: "ReRoll",
        cancelButtonText: "Cancel"
    }).then(res => {
        //check how many remains
        let _diff = check[1].filter(r => !r).length;
        //confirm reroll
        if (res.isConfirmed) {
            game.reduceStamina();
            //check : [true, [], roll, _skill, val]
            let _check = game.skillCheck(check[3], _diff);
            if (_check[0]) {
                //successful check
                reward.push("P4");
                Resolve(game, _title, _check, reward)
            }
            else if (game.stamina[0] == 0) {
                //failed check
                Resolve(game, _title, _check, ["P3"])
            }
            else {
                ReRoll(game, _title, _check, reward)
            }
        }
        else {
            //notify of result
            Resolve(game, _title, check, ["P3"]);
        }
    })
}