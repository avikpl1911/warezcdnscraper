import { load } from "cheerio";
import axios from "axios";

const cdnListing = [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64];

const getVideowlUrlStream = async (id: string) => {
  const sharePage = await (
    await fetch("https://cloud.mail.ru/public/uaRH/2PYWcJRpH")
  ).text();
  const regex = /"videowl_view":\{"count":"(\d+)","url":"([^"]+)"\}/g;
  const videowlUrl = regex.exec(sharePage)?.[2];

  return `${videowlUrl}/0p/${btoa(id)}.m3u8?${new URLSearchParams({
    double_encode: "1",
  })}`;
};

const checkurl = async (fileid: string) => {
  for (const id of cdnListing) {
    const url = `https://cloclo${id}.cloud.mail.ru/weblink/view/${fileid}`;
    // const response = await ctx.proxiedFetcher.full(url, {
    //   method: 'GET',
    //   headers: {
    //     Range: 'bytes=0-1',
    //   },
    // });
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Range: "bytes=0-1",
      },
    });

    if (response.status === 206) return url;
  }
  //   return null;
};

function decrypt(input: string) {
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

const warezhlsscraper = async (embedurl: string) => {
  const decryptedId = await getDecryptedId(embedurl);
  const streamUrl = await getVideowlUrlStream(decryptedId);
  return streamUrl;
};

const warezmp4scraper = async (embedurl: string) => {
  const decryptedId = await getDecryptedId(embedurl);
  const streamurl = await checkurl(decryptedId);
  return streamurl;
};

const getDecryptedId = async (embedUrl: string) => {
  const page = await (
    await fetch(`https://warezcdn.com/player/player.php?id=${embedUrl}`, {
      method: "GET",
      headers: {
        Referer: `https://warezcdn.com/player/getEmbed.php?${new URLSearchParams(
          {
            id: embedUrl,
            sv: "warezcdn",
          }
        )}`,
      },
    })
  ).text();

  const allowanceKey = page.match(/let allowanceKey = "(.*?)";/)?.[1];

  const streamdata = await (
    await fetch(`https://warezcdn.com/player/functions.php`, {
      method: "POST",
      body: new URLSearchParams({
        getVideo: embedUrl,
        key: allowanceKey,
      }),
    })
  ).text();

  const stream = JSON.parse(streamdata);

  const decryptedId = decrypt(stream.id);

  return decryptedId;
};

const musefunc = {
    movie: async ()=>{
        const resp = await(await fetch(`https://embed.warezcdn.com/filme/tt0111161`)).text();
        const episodeId = resp.match(/\$\('\[data-load-episode-content="(\d+)"\]'\)/)?.[1];
        console.log(episodeId)
        const $ = load(resp);
        const embedsHost = $(".hostList.active [data-load-embed]").get();
        console.log(embedsHost)
      
        embedsHost.forEach(async (element) => {
          const embedHost = $(element).attr("data-load-embed-host")!;
          const embedUrl = $(element).attr("data-load-embed")!;
          if (embedHost == "warezcdn") {
            console.log({
              hls: await warezhlsscraper(embedUrl),
              mp4: await warezmp4scraper(embedUrl),
            });
          }
        });
    },
    tv: async ()=>{
        const url = `https://embed.warezcdn.com/serie/tt12637874/1/1`;
    const serversPage = await (await fetch(url)).text();
    const episodeId = serversPage.match(/\$\('\[data-load-episode-content="(\d+)"\]'\)/)?.[1];
    console.log(episodeId)
    const streamsData = await(await fetch(`https://embed.warezcdn.com/serieAjax.php`, {
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
    console.log(streams)
    const list = streams.list['1'];
    if(list.warezcdnStatus === "3"){
        console.log(await warezhlsscraper(list.id))
    }
    }
}


const find = (async function () {
    // musefunc.movie()
    // console.log(await warezhlsscraper('149274'))
})();
