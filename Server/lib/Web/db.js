const LANG = ["ko", "en"];
const PgPool = require("pg").Pool;
const GLOBAL = require("../sub/global.json");
const PLLog = require("../sub/jjlog");
const Collection = require("../sub/collection");
const Pub = require("../sub/checkpub");

const FAKE_REDIS_FUNC = () => {
    var R = new Lizard.Tail();
    R.go({});
    return R;
};

const FAKE_REDIS = {
    putGlobal: FAKE_REDIS_FUNC,
    getGlobal: FAKE_REDIS_FUNC,
    getPage: FAKE_REDIS_FUNC,
    getSurround: FAKE_REDIS_FUNC
};

Pub.ready = function(isPub) {
    var Redis = require("redis").createClient();
    var Pg = new PgPool({
        user: GLOBAL.PG_USER,
        password: GLOBAL.PG_PASSWORD,
        port: GLOBAL.PG_PORT,
        database: GLOBAL.PG_DATABASE,
        host: GLOBAL.PG_HOST
    });
    var IoPg = new PgPool({
        user: GLOBAL.IO_USER,
        password: GLOBAL.IO_PASSWORD,
        port: GLOBAL.IO_PORT,
        database: GLOBAL.IO_DATABASE,
        host: GLOBAL.IO_HOST
    });

    Redis.on('connect', function() {
        connectPg(false);
    });

    Redis.on('error', function(err) {
        PLLog.error("Error from Redis: " + err);
        PLLog.alert("Run with no-redis mode.");
        Redis.quit();
        connectPg(true);
    });

    function connectPg(noRedis) {
        Pg.connect(function(err, pgMain) {
            if (err) {
                PLLog.error("Error when connecting to main PostgreSQL server: " + err.toString());
                return;
            }
            connectIoPg(pgMain, noRedis);
        });
    }

    function connectIoPg(pgMain, noRedis) {
        PLLog.info("KKuTuIO Conn...");
        IoPg.connect(function(err, pgIoMain) {
            if (err) {
                if (err instanceof AggregateError) {
                    err.errors.forEach(error => PLLog.error("Individual error: " + error.toString()));
                } else {
                    PLLog.error("Error when connecting to KKuTuIO PostgreSQL server: " + err.toString());
                }
                return;
            }
            initializeDatabase(pgMain, pgIoMain, noRedis);
        });
    }

    function initializeDatabase(pgMain, pgIoMain, noRedis) {
        var redisAgent = noRedis ? null : new Collection.Agent("Redis", Redis);
        var mainAgent = new Collection.Agent("Postgres", pgMain);
        var ioAgent = new Collection.Agent("Postgres", pgIoMain);

        var DB = exports;
        var i;

        DB.kkutu = {};
        DB.kkutu_cw = {};
        DB.kkutu_manner = {};

        DB.redis = noRedis ? FAKE_REDIS : new redisAgent.Table("KKuTu_Score");

        for (i in LANG) {
            DB.kkutu[LANG[i]] = new mainAgent.Table("kkutu_" + LANG[i]);
            DB.kkutu_cw[LANG[i]] = new mainAgent.Table("kkutu_cw_" + LANG[i]);
            DB.kkutu_manner[LANG[i]] = new mainAgent.Table("kkutu_manner_" + LANG[i]);
        }
        DB.kkutu_injeong = new mainAgent.Table("kkutu_injeong");
        DB.kkutu_shop = new mainAgent.Table("kkutu_shop");
        DB.kkutu_shop_desc = new mainAgent.Table("kkutu_shop_desc");
        DB.kkutu_coupon = new mainAgent.Table("kkutu_coupon");
        DB.kkutu_coupon_log = new mainAgent.Table("kkutu_coupon_log");

        DB.session = new mainAgent.Table("session");
        DB.users = new mainAgent.Table("users");
		DB.migrators = new mainAgent.Table("migrators");

        DB.ip_block = new mainAgent.Table("ip_block");

        DB.io_session = new ioAgent.Table("session");
        DB.io_users = new ioAgent.Table("users");

        if (exports.ready) {
            exports.ready(Redis, Pg, IoPg);
        } else {
            PLLog.warn("DB.onReady was not defined yet.");
        }
    }
};
