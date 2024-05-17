"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const cdnListing = [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64];
const getVideowlUrlStream = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const sharePage = yield (yield fetch("https://cloud.mail.ru/public/uaRH/2PYWcJRpH")).text();
    const regex = /"videowl_view":\{"count":"(\d+)","url":"([^"]+)"\}/g;
    const videowlUrl = (_a = regex.exec(sharePage)) === null || _a === void 0 ? void 0 : _a[2];
    return `${videowlUrl}/0p/${btoa(id)}.m3u8?${new URLSearchParams({
        double_encode: "1",
    })}`;
});
const checkurl = (fileid) => __awaiter(void 0, void 0, void 0, function* () {
    for (const id of cdnListing) {
        const url = `https://cloclo${id}.cloud.mail.ru/weblink/view/${fileid}`;
        // const response = await ctx.proxiedFetcher.full(url, {
        //   method: 'GET',
        //   headers: {
        //     Range: 'bytes=0-1',
        //   },
        // });
        const response = yield fetch(url, {
            method: "GET",
            headers: {
                Range: "bytes=0-1",
            },
        });
        if (response.status === 206)
            return url;
    }
    //   return null;
});
function decrypt(input) {
    let output = atob(input);
    // Remove leading and trailing whitespaces
    output = output.trim();
    // Reverse the string
    output = output.split("").reverse().join("");
    // Get the last 5 characters and reverse them
    let last = output.slice(-5);
    last = last.split("").reverse().join("");
    // Remove the last 5 characters from the original string
    output = output.slice(0, -5);
    // Return the original string concatenated with the reversed last 5 characters
    return `${output}${last}`;
}
const warezhlsscraper = (embedurl) => __awaiter(void 0, void 0, void 0, function* () {
    const decryptedId = yield getDecryptedId(embedurl);
    const streamUrl = yield getVideowlUrlStream(decryptedId);
    return streamUrl;
});
const warezmp4scraper = (embedurl) => __awaiter(void 0, void 0, void 0, function* () {
    const decryptedId = yield getDecryptedId(embedurl);
    const streamurl = yield checkurl(decryptedId);
    return streamurl;
});
const getDecryptedId = (embedUrl) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const page = yield (yield fetch(`https://warezcdn.com/player/player.php?id=${embedUrl}`, {
        method: "GET",
        headers: {
            Referer: `https://warezcdn.com/player/getEmbed.php?${new URLSearchParams({
                id: embedUrl,
                sv: "warezcdn",
            })}`,
        },
    })).text();
    const allowanceKey = (_b = page.match(/let allowanceKey = "(.*?)";/)) === null || _b === void 0 ? void 0 : _b[1];
    const streamdata = yield (yield fetch(`https://warezcdn.com/player/functions.php`, {
        method: "POST",
        body: new URLSearchParams({
            getVideo: embedUrl,
            key: allowanceKey,
        }),
    })).text();
    const stream = JSON.parse(streamdata);
    const decryptedId = decrypt(stream.id);
    return decryptedId;
});
const musefunc = {
    movie: () => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        const resp = yield (yield fetch(`https://embed.warezcdn.com/filme/tt0111161`)).text();
        const episodeId = (_c = resp.match(/\$\('\[data-load-episode-content="(\d+)"\]'\)/)) === null || _c === void 0 ? void 0 : _c[1];
        console.log(episodeId);
        const $ = (0, cheerio_1.load)(resp);
        const embedsHost = $(".hostList.active [data-load-embed]").get();
        console.log(embedsHost);
        embedsHost.forEach((element) => __awaiter(void 0, void 0, void 0, function* () {
            const embedHost = $(element).attr("data-load-embed-host");
            const embedUrl = $(element).attr("data-load-embed");
            if (embedHost == "warezcdn") {
                console.log({
                    hls: yield warezhlsscraper(embedUrl),
                    mp4: yield warezmp4scraper(embedUrl),
                });
            }
        }));
    }),
    tv: () => __awaiter(void 0, void 0, void 0, function* () {
        var _d;
        const url = `https://embed.warezcdn.com/serie/tt12637874/1/1`;
        const serversPage = yield (yield fetch(url)).text();
        const episodeId = (_d = serversPage.match(/\$\('\[data-load-episode-content="(\d+)"\]'\)/)) === null || _d === void 0 ? void 0 : _d[1];
        console.log(episodeId);
        const streamsData = yield (yield fetch(`https://embed.warezcdn.com/serieAjax.php`, {
            method: 'POST',
            body: new URLSearchParams({
                getAudios: episodeId,
            }),
            headers: {
                Origin: "https://embed.warezcdn.com/",
                Referer: url,
                'X-Requested-With': 'XMLHttpRequest',
            },
        })).text();
        const streams = JSON.parse(streamsData);
        console.log(streams);
        const list = streams.list['1'];
        if (list.warezcdnStatus === "3") {
            console.log(yield warezhlsscraper(list.id));
        }
    })
};
const find = (function () {
    return __awaiter(this, void 0, void 0, function* () {
        // musefunc.movie()
        // console.log(await warezhlsscraper('149274'))
    });
})();
//# sourceMappingURL=index.js.map