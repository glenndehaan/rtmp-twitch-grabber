const exec = require('child_process').exec;
const log = require('simple-node-logger').createSimpleLogger('rtmp-hls-testing.log');
const TwitchApi = require('twitch-api');
const config = require('./config');

const twitch = new TwitchApi({
    clientId: config.application.twitch.clientId,
    clientSecret: config.application.twitch.clientSecret,
    redirectUri: config.application.twitch.redirectUri
});

log.setLevel(config.application.logLevel);

startProcess = (streamName) => {
    exec(`streamlink -O twitch.tv/${streamName} best | ffmpeg -i - -c copy -acodec aac -ab 128k -g 50 -strict experimental -f flv ${config.application.rtmpUrl}/${streamName} > /var/log/streams/${streamName}.log 2>&1 &`, (error, stdout, stderr) => {
        log.info('[SYSTEM] stdout: ' + stdout);
        log.trace('streamName ', streamName);

        config.application.offline_streams.push(streamName);

        if (error !== null) {
            log.error('[SYSTEM] exec error: ' + error);
        }

        if (stderr !== "") {
            log.error('[SYSTEM] stderr: ' + stderr);
        }
    });
};

log.info('[NODE] Node Loaded !');
log.info(`[NODE] Streams to play: ${config.application.streams.join(', ')}`);
log.info('[TWITCH] Getting access token !');

log.info(`[TWITCH] authorizationurl ${twitch.getAuthorizationUrl()}`);

for(let stream = 0; stream < config.application.streams.length; stream++){
    twitch.getChannelStream(config.application.streams[stream], (err, body) => {
        log.info(`[TWITCH] Getting channel data for stream: ${config.application.streams[stream]}`);

        if (err) {
            log.error('[TWITCH] Error getting stream data!');
        } else {
            if(typeof body !== "undefined" && body !== null && typeof body.stream !== "undefined" && body.stream !== null) {
                log.info(`[NODE] Starting stream: ${config.application.streams[stream]}`);
                startProcess(config.application.streams[stream]);
            }else{
                log.info(`[NODE] The following stream is offline: ${config.application.streams[stream]} doing nothing...`);
                config.application.offline_streams.push(config.application.streams[stream]);
            }
        }
    });
}

setInterval(() => {
    for(let offline_stream = 0; offline_stream < config.application.offline_streams.length; offline_stream++){
        twitch.getChannelStream(config.application.offline_streams[offline_stream], (err, body) => {
            log.info(`[OFFLINE_CHECK][TWITCH] Getting channel data for stream: ${config.application.offline_streams[offline_stream]}`);

            if (err) {
                log.error('[OFFLINE_CHECK][TWITCH] Error getting stream data!');
            } else {
                if(typeof body !== "undefined" && body !== null && typeof body.stream !== "undefined" && body.stream !== null) {
                    log.info(`[OFFLINE_CHECK][NODE] Starting stream: ${config.application.offline_streams[offline_stream]}`);
                    startProcess(config.application.offline_streams[offline_stream]);

                    let index = config.application.offline_streams.indexOf(config.application.offline_streams[offline_stream]);

                    if (index > -1) {
                        config.application.offline_streams.splice(index, 1);
                    }
                }else{
                    log.info(`[OFFLINE_CHECK][NODE] The following stream is still offline: ${config.application.offline_streams[offline_stream]} doing nothing...`);
                }
            }

            log.trace('config.application.offline_streams', config.application.offline_streams);
        });
    }
}, 600000); // = 5 Min
