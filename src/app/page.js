"use client";

import Image from "next/image";
import moment from "moment";
import React from "react";

export default function Home() {
  const [user, setuser] = React.useState("");
  const [token, settoken] = React.useState("");

  const [url, seturl] = React.useState("");

  const [data, setdata] = React.useState({ data: [] });

  const [show, setshow] = React.useState(false);

  // const [ht, setht] = React.useState(0);

  console.log(url);

  async function getImages(url, ht) {
    setshow(true);
    url = `https://graph.facebook.com/v17.0/${ht}/recent_media?access_token=${token}&user_id=${user}&limit=50&fields=caption%2Cchildren%2Cmedia_type%2Cmedia_url%2Cpermalink%2Ctimestamp`;
    const options = {
      method: "GET",
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      console.log(result);
      console.log(typeof result);
      // const j = await result.json();
      setdata(result);
      seturl(result.paging.next);
      setshow(false);
    } catch (error) {
      console.error(error);
      setshow(false);
    }
  }

  async function getNext(url, ht) {
    setshow(true);
    if (!url)
      url = `https://graph.facebook.com/v17.0/${ht}/recent_media?access_token=${token}&user_id=${user}&limit=50&fields=caption%2Cchildren%2Cmedia_type%2Cmedia_url%2Cpermalink%2Ctimestamp`;
    const options = {
      method: "GET",
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      console.log(result);
      console.log(typeof result);
      // const j = await result.json();
      setdata(result);
      seturl(result.paging.next);
      window.scrollTo(0, 0);
      setshow(false);
    } catch (error) {
      console.error(error);
      setshow(false);
    }
  }

  const handleSubmit = async (event) => {
    // Stop the form from submitting and refreshing the page.
    event.preventDefault();

    // Send the data to the server in JSON format.
    setuser(event.target.first.value);
    settoken(event.target.last.value);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {show ? (
        <p class="fixed top-0 left-0 right-0 bg-amber-500 text-white p-1 text-center">
          Loading...
        </p>
      ) : (
        <p class="fixed top-0 left-0 right-0 bg-indigo-500 text-white p-1 text-center">
          Ready
        </p>
      )}
      {user && token ? (
        <div>
          <div className="flex gap-1 mb-4">
            <button
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
              onClick={() => getImages(url, "17843786962029833")}
            >
              Casting Call
            </button>
            <button
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
              onClick={() => getImages(url, "17843857102059948")}
            >
              Shortfilm
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {data.data.map((i, index) => {
              if (i.media_type === "IMAGE")
                return (
                  <div
                    key={index}
                    className="m-6"
                    style={{ maxWidth: "300px" }}
                  >
                    <a href={i.permalink}>
                      <Image
                        src={i.media_url}
                        className="dark:invert"
                        width={400}
                        height={400}
                        style={{
                          width: "auto",
                          height: "auto",
                        }}
                      />
                    </a>
                    <p className="truncate" style={{ maxWidth: "300px" }}>
                      {i.caption}
                    </p>
                    <p style={{ maxWidth: "300px" }} className="text-xs">
                      {moment(i.timestamp).fromNow()}
                    </p>
                  </div>
                );
              else if (
                i.media_type === "VIDEO" ||
                i.media_type === "CAROUSEL_ALBUM"
              )
                return (
                  <div key={index}>
                    <a href={i.permalink}>
                      {i.media_url ? (
                        <video style={{ width: "300px", height: "300px" }}>
                          <source src={i.media_url} />
                        </video>
                      ) : (
                        <Image
                          src={"/Image_not_available.png"}
                          className="dark:invert"
                          width={400}
                          height={400}
                          style={{
                            width: "auto",
                            height: "auto",
                          }}
                        />
                      )}
                    </a>
                    <p className="truncate" style={{ maxWidth: "300px" }}>
                      {i.caption}
                    </p>
                    <p style={{ maxWidth: "300px" }} className="text-xs">
                      {moment(i.timestamp).fromNow()}
                    </p>
                  </div>
                );
            })}
          </div>
          <div className="flex min-h-screen flex-col">
            <button
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-6 px-4 border border-gray-400 rounded shadow"
              onClick={() => getNext(url)}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="first">User ID</label>
          <input type="text" id="first" name="first" required />

          <label htmlFor="last">Token</label>
          <input type="password" id="last" name="last" required />

          <button type="submit">Submit</button>
        </form>
      )}
    </main>
  );
}
