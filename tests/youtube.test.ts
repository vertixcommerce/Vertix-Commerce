import { describe, expect, it } from "vitest";
import { youtubeVideo } from "@/lib/youtube";
describe("YouTube review links",()=>{
  it("accepts common YouTube link formats",()=>{
    for (const url of ["https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=5s","https://youtu.be/dQw4w9WgXcQ?si=abc","https://m.youtube.com/watch?v=dQw4w9WgXcQ","https://www.youtube.com/embed/dQw4w9WgXcQ"]) expect(youtubeVideo(url)).toEqual({id:"dQw4w9WgXcQ",vertical:false});
    expect(youtubeVideo("https://youtube.com/shorts/dQw4w9WgXcQ")).toEqual({id:"dQw4w9WgXcQ",vertical:true});
  });
  it("rejects non-YouTube, insecure and malformed links",()=>{
    for (const url of ["","http://youtu.be/dQw4w9WgXcQ","https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ","https://vimeo.com/123","https://youtu.be/short","https://www.youtube.com/@vertix",null]) expect(youtubeVideo(url)).toBeNull();
  });
});
