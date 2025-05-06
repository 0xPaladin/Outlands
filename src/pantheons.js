/*
  Pantheons
*/

const BasePantheons = "Norse,Celtic,Greek,Egyptian,Buntu,Yoruba,Nahua,Incan,Hindu,Chinese,Polynesian,Outsiders";
const Pantheons = {
    Norse: {
        climate: "frigid,temperate/5,5",
        realms: {
            Asgard: {}
        }
    },
    Celtic: {},
    Greek: {
        climate: "temperate,torrid/8,2",
        realms: {
            Elysium: {}
        }
    },
    Egyptian: {
        climate: "temperate,torrid/4,6",
        realms: {
            Aaru: {}
        }
    },
    Buntu: {
        climate: "temperate,torrid/3,7"
    },
    Yoruba: {
        climate: "temperate,torrid/3,7"
    },
    Hindu: {
        climate: "frigid,temperate,torrid/1,7,4",
        realms: {
            Svarga: {}
        }
    },
    Chinese: {
        realms: {
            Tian: {}
        }
    },
    Polynesian: {
        climate: "temperate,torrid/2,8"
    },
    Nahua: {
        climate: "temperate,torrid/2,8",
        realms: {
            Yaxché: {}
        }
    },
    Incan: {
        climate: "frigid,temperate,torrid/1,2,7",
        realms: {
            Hanan: {}
        }
    }
};

const RandomPantheon = (exclude, PRNG) => {
  return PRNG.pickone(
    BasePantheons.split(",").filter((id) => !exclude.includes(id))
  );
};

//Build realms from Pantheon Realms
const Realms = Object.entries(Pantheons).reduce( (R, [id,P]) => {
    Object.keys(P.realms || {}).forEach( (rid) => {
        R[rid] = Object.assign({
            _pantheon: id
        }, P.realms[rid]);
    }
    );
    return R;
}
, {});

/*

//a prime will have a number of claim
        let _nc = _realm == "Prime" ? PRNG.weighted([0, 1, 2], [2, 6, 2]) : _realm == "Outlands" ? PRNG.weighted([0, 1], [3, 7]) : 0;

        //generate faction claims
        this._factions = []
        let _factions = PRNG.shuffle(BasePantheons.split(",")).slice(0, _nc);
        _factions = Realms[_realm] ? [Realms[_realm]._pantheon] : _factions;
        _factions.forEach( (f) => this._factions.push(FeatureGen.faction(this, {
            pantheon: f
        })));

        */