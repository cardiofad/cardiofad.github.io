/* Fill in these values when the final assets/URLs are ready. Paths are relative to index.html.
   Empty values intentionally render placeholders and make no media requests. */
window.CARDIOFAD = {
  paperUrl: "",
  arxivUrl: "",
  bibtex: "",
  // Optional: replace the explicitly labeled Scholar search with a verified personal profile.
  limaScholarUrl: "",
  images: {
    teaser: "static/images/teaser.png",     // e.g. "static/images/teaser.png"             (Figure 1)
    framework: "static/images/framework.png",  // e.g. "static/images/framework.png"          (Figure 2)
    table1: "static/images/table-1.png",     // e.g. "static/images/table-1.png"
    table2: "static/images/table-2.png",     // e.g. "static/images/table-2.png"
    fig3: "static/images/qualitative-1.png",       // e.g. "static/images/figure-3.png"
    fig11: "static/images/qualitative-2.png",      // e.g. "static/images/figure-11.png"
    fig12: "static/images/qualitative-3.png"       // e.g. "static/images/figure-12.png"
  },
  videos: {
    // Each row below is one example: Original (GT) on the left, Synthetic on the right.
    // Example: { original: "static/videos/cmr-01-gt.mp4", synthetic: "static/videos/cmr-01-synthetic.mp4" }
    cmr: [
      // Source frame/depth indices are zero-based. Keep depths 01–11, excluding padded edges.
      // Labels retain the original 13-slice coordinates; observed images are exact decoded GT frames.
      {
        task: "Volume2Seq", sliceDirectory: "static/videos/CMR/slices/UKBB/1045169_20209_2_0_CINE_SAX_4D",
        sliceCount: 13, minSlice: 1, maxSlice: 11, defaultSlice: 6,
        observed: { type: "volume", frame: 18, directory: "static/images/CMR/observed/1045169_20209_2_0_CINE_SAX_4D/frame_18" }
      },
      {
        task: "Volume2Seq", sliceDirectory: "static/videos/CMR/slices/UKBB/1023113_20209_2_0_CINE_SAX_4D",
        sliceCount: 13, minSlice: 1, maxSlice: 11, defaultSlice: 6,
        observed: { type: "volume", frame: 29, directory: "static/images/CMR/observed/1023113_20209_2_0_CINE_SAX_4D/frame_29" }
      },
      {
        task: "Volume2Seq", sliceDirectory: "static/videos/CMR/slices/UKBB/1025994_20209_2_0_CINE_SAX_4D",
        sliceCount: 13, minSlice: 1, maxSlice: 11, defaultSlice: 6,
        observed: { type: "volume", frame: 7, directory: "static/images/CMR/observed/1025994_20209_2_0_CINE_SAX_4D/frame_07" }
      },
      {
        task: "Volume2Seq", sliceDirectory: "static/videos/CMR/slices/UKBB/1143454_20209_2_0_CINE_SAX_4D",
        sliceCount: 13, minSlice: 1, maxSlice: 11, defaultSlice: 6,
        observed: { type: "volume", frame: 44, directory: "static/images/CMR/observed/1143454_20209_2_0_CINE_SAX_4D/frame_44" }
      },
      {
        task: "Slice2Seq", sliceDirectory: "static/videos/CMR/slices/UKBB/1173572_20209_3_0_CINE_SAX_4D",
        sliceCount: 13, minSlice: 1, maxSlice: 11, defaultSlice: 6,
        observed: { type: "slice", frame: 34, depth: 4, directory: "static/images/CMR/observed/1173572_20209_3_0_CINE_SAX_4D/frame_34" }
      },
      {
        task: "Slice2Seq", sliceDirectory: "static/videos/CMR/slices/UKBB/1201944_20209_2_0_CINE_SAX_4D",
        sliceCount: 13, minSlice: 1, maxSlice: 11, defaultSlice: 6,
        observed: { type: "slice", frame: 5, depth: 2, directory: "static/images/CMR/observed/1201944_20209_2_0_CINE_SAX_4D/frame_05" }
      },
      {
        task: "Slice2Seq", sliceDirectory: "static/videos/CMR/slices/UKBB/1298151_20209_2_0_CINE_SAX_4D",
        sliceCount: 13, minSlice: 1, maxSlice: 11, defaultSlice: 6,
        observed: { type: "slice", frame: 41, depth: 7, directory: "static/images/CMR/observed/1298151_20209_2_0_CINE_SAX_4D/frame_41" }
      },
      {
        task: "Slice2Seq", sliceDirectory: "static/videos/CMR/slices/UKBB/1347534_20209_2_0_CINE_SAX_4D",
        sliceCount: 13, minSlice: 1, maxSlice: 11, defaultSlice: 6,
        observed: { type: "slice", frame: 26, depth: 10, directory: "static/images/CMR/observed/1347534_20209_2_0_CINE_SAX_4D/frame_26" }
      }
    ],
    echo: [
      {
        original: "static/videos/ECHO/0X100CF05D141FF143_GT.mp4", synthetic: "static/videos/ECHO/0X100CF05D141FF143.mp4",
        frameCount: 125, observed: { type: "frame", frame: 74, image: "static/images/ECHO/observed/0X100CF05D141FF143/frame_074.png" }
      },
      {
        original: "static/videos/ECHO/0X100E3B8D3280BEC5_GT.mp4", synthetic: "static/videos/ECHO/0X100E3B8D3280BEC5.mp4",
        frameCount: 125, observed: { type: "frame", frame: 30, image: "static/images/ECHO/observed/0X100E3B8D3280BEC5/frame_030.png" }
      },
      {
        original: "static/videos/ECHO/0X100E491B3CD58DE2_GT.mp4", synthetic: "static/videos/ECHO/0X100E491B3CD58DE2.mp4",
        frameCount: 125, observed: { type: "frame", frame: 102, image: "static/images/ECHO/observed/0X100E491B3CD58DE2/frame_102.png" }
      },
      {
        original: "static/videos/ECHO/0X100F044876B98F90_GT.mp4", synthetic: "static/videos/ECHO/0X100F044876B98F90.mp4",
        frameCount: 125, observed: { type: "frame", frame: 68, image: "static/images/ECHO/observed/0X100F044876B98F90/frame_068.png" }
      },
      {
        original: "static/videos/ECHO/0X101C388397F66EDB_GT.mp4", synthetic: "static/videos/ECHO/0X101C388397F66EDB.mp4",
        frameCount: 125, observed: { type: "frame", frame: 49, image: "static/images/ECHO/observed/0X101C388397F66EDB/frame_049.png" }
      },
      {
        original: "static/videos/ECHO/0X101CFC9C5351DCBE_GT.mp4", synthetic: "static/videos/ECHO/0X101CFC9C5351DCBE.mp4",
        frameCount: 125, observed: { type: "frame", frame: 88, image: "static/images/ECHO/observed/0X101CFC9C5351DCBE/frame_088.png" }
      }
    ]
  }
};
