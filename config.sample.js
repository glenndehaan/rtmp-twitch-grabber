module.exports = {
    application: {
        logLevel: 'trace', // trace, debug, info, warn, error or fatal
        rtmpUrl: 'rtmp://localhost/hls',
        twitch: {
            clientId: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
            clientSecret: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
            redirectUri: 'http://localhost'
        },
        streams: [
            "esl_csgo",
            "dreamhackcs",
            "glenndehaan"
        ],
        offline_streams: []
    }
};
