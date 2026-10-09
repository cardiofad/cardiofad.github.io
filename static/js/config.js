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
      { original: "static/videos/CMR/1045169_20209_2_0_CINE_SAX_4D_GT.mp4", synthetic: "static/videos/CMR/1045169_20209_2_0_CINE_SAX_4D.mp4" }, // Example 01
      { original: "static/videos/CMR/1023113_20209_2_0_CINE_SAX_4D_GT.mp4", synthetic: "static/videos/CMR/1023113_20209_2_0_CINE_SAX_4D.mp4" }, // Example 02
      { original: "static/videos/CMR/1025994_20209_2_0_CINE_SAX_4D_GT.mp4", synthetic: "static/videos/CMR/1025994_20209_2_0_CINE_SAX_4D.mp4" }, // Example 03
      { original: "static/videos/CMR/1143454_20209_2_0_CINE_SAX_4D_GT.mp4", synthetic: "static/videos/CMR/1143454_20209_2_0_CINE_SAX_4D.mp4" }, // Example 04
      { original: "static/videos/CMR/1173572_20209_3_0_CINE_SAX_4D_GT.mp4", synthetic: "static/videos/CMR/1173572_20209_3_0_CINE_SAX_4D.mp4" }, // Example 05
      { original: "static/videos/CMR/1201944_20209_2_0_CINE_SAX_4D_GT.mp4", synthetic: "static/videos/CMR/1201944_20209_2_0_CINE_SAX_4D.mp4" }  // Example 06
    ],
    echo: [
      { original: "static/videos/ECHO/0X100CF05D141FF143_GT.mp4", synthetic: "static/videos/ECHO/0X100CF05D141FF143.mp4" }, // Example 01
      { original: "static/videos/ECHO/0X100E3B8D3280BEC5_GT.mp4", synthetic: "static/videos/ECHO/0X100E3B8D3280BEC5.mp4" }, // Example 02
      { original: "static/videos/ECHO/0X100E491B3CD58DE2_GT.mp4", synthetic: "static/videos/ECHO/0X100E491B3CD58DE2.mp4" }, // Example 03
      { original: "static/videos/ECHO/0X100F044876B98F90_GT.mp4", synthetic: "static/videos/ECHO/0X100F044876B98F90.mp4" }, // Example 04
      { original: "static/videos/ECHO/0X101C388397F66EDB_GT.mp4", synthetic: "static/videos/ECHO/0X101C388397F66EDB.mp4" }, // Example 05
      { original: "static/videos/ECHO/0X101CFC9C5351DCBE_GT.mp4", synthetic: "static/videos/ECHO/0X101CFC9C5351DCBE.mp4" }  // Example 06
    ]
  }
};
