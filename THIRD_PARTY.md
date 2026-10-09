# Third-party attribution

## Nerfies website template

The CardioFAD project page adapts the publication-page structure and styling conventions of the [Nerfies website](https://nerfies.github.io), by the Nerfies authors: Keunhong Park, Utkarsh Sinha, Jonathan T. Barron, Sofien Bouaziz, Dan B Goldman, Steven M. Seitz, and Ricardo Martin-Brualla.

- Source: [nerfies/nerfies.github.io](https://github.com/nerfies/nerfies.github.io).
- Reference revision: [`657409a62d59a93163872c0e4921cf651b987810`](https://github.com/nerfies/nerfies.github.io/tree/657409a62d59a93163872c0e4921cf651b987810), retrieved on 2026-10-06.
- Upstream website license: [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/). A local copy is in `static/licenses/CC-BY-SA-4.0.txt`.
- The adapted website layout is provided under the same CC BY-SA 4.0 license. Changes include CardioFAD-specific text, authors, links, section arrangement, responsive styling, and empty media slots. Paper content, future figures/videos, and the separately linked CardioFAD research code retain their own rights and are not relicensed by this notice.
- Retain the visible Nerfies credit and license link in the website footer when redistributing this derived layout.

The original upstream `index.html`, `static/css/index.css`, and `README.md` are kept only in `.work/nerfies-reference/` as a local reference. They are not part of the public website implementation. The original reference HTML contains upstream analytics markup; the CardioFAD page must not execute or copy that markup. No Nerfies images, videos, or tracking scripts were downloaded as website assets.

## Bulma 0.9.1

`static/css/bulma.min.css` is an unmodified copy of the CSS distributed by the Nerfies repository at the revision above. It includes the original Bulma and minireset.css license banners.

- Original project: [Bulma](https://github.com/jgthms/bulma), Jeremy Thomas.
- Version: 0.9.1, with bundled minireset.css 0.0.6.
- License: MIT. The Bulma 0.9.1 license text is preserved in `static/licenses/BULMA-MIT.txt`; the bundled minireset.css 0.0.6 license is in `static/licenses/MINIRESET-MIT.txt` (retrieved from the published npm 0.0.6 package).
- Download source: [pinned upstream CSS](https://raw.githubusercontent.com/nerfies/nerfies.github.io/657409a62d59a93163872c0e4921cf651b987810/static/css/bulma.min.css).
- File size: 204030 bytes.
- SHA-256: `58b28659220961ead137cb5b346b5759562750ce703094d70fc786e0db467033`.

## Nerfies resource buttons

The Paper, arXiv, and Code buttons use the original Nerfies `link-block`, `external-link button is-normal is-rounded is-dark`, and `icon` markup. Their size, padding, icon alignment, and dark colors come directly from the unmodified Bulma stylesheet; the original 5 px link-block vertical margins are retained.

- **Font Awesome Free 5.15.1:** `static/css/fontawesome.all.min.css` and `static/js/fontawesome.all.min.js` are unmodified copies from the pinned Nerfies revision above. The matching `fa-solid-900.woff2` and `fa-brands-400.woff2` fallback fonts come from [Font Awesome 5.15.1](https://github.com/FortAwesome/Font-Awesome/tree/5.15.1). The original `fas fa-file-pdf` and `fab fa-github` icons are used. The package license notice is preserved in `static/licenses/FONT-AWESOME-LICENSE.txt` (icons: CC BY 4.0, fonts: SIL OFL 1.1, code: MIT).
- **Academicons 1.9.6:** `static/css/academicons.min.css` and `static/fonts/academicons.*` are unmodified copies of [Academicons 1.9.6](https://github.com/jpswalsh/academicons/tree/1.9.6), the version resolved by Nerfies' `academicons@1` stylesheet on 2026-10-07. The original `ai ai-arxiv` icon is used. Font licensing is SIL OFL 1.1; CSS licensing is MIT. The upstream attribution and license notice are retained in `static/licenses/ACADEMICONS-LICENSE.txt`.
- **Noto Sans Regular:** `static/fonts/NotoSans-Regular.ttf` was retrieved from Google Fonts on 2026-10-07. It reproduces the original Nerfies resource-button typeface locally, under the CSS alias `Nerfies Noto Sans`, scoped to the resource buttons. The SIL OFL 1.1 license is preserved in `static/licenses/NOTO-SANS-OFL.txt`.

All resource-button dependencies are served locally. No jQuery, slider add-on, external font request, or tracking script is required. The qualitative image carousel uses the separate local component documented below.

## Nerfies authors, affiliations, and BibTeX

The author and affiliation rows use the upstream `is-size-5 publication-authors` and inline `author-block` markup, Google Sans typography, comma separators, and original author-link color. The BibTeX section uses the upstream `container is-max-desktop content`, `h2.title`, and `pre/code` structure with Bulma's default typography, spacing, and gray code-block background. Its citation text remains configurable in `static/js/config.js`.

- **Google Sans Regular:** `static/fonts/GoogleSans-Regular.ttf` was retrieved on 2026-10-07 from the Google Fonts stylesheet linked in the pinned Nerfies HTML. It is used under the scoped CSS alias `Nerfies Google Sans`. The original [Google Sans SIL OFL 1.1 license](https://github.com/google/fonts/blob/main/ofl/googlesans/OFL.txt) is preserved in `static/licenses/GOOGLE-SANS-OFL.txt`.
- The BibTeX section reuses the local Noto Sans font and its license listed above.

## Academic Project Page Template image carousel

The single-image qualitative carousel adopts the image-and-caption item structure and Bulma Carousel initialization from [Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template), by Eliahu Horwitz. The reference revision is `d38af1ccae1ce82c3404d2820c4c646afd409f81`, retrieved on 2026-10-07. The template is licensed under CC BY-SA 4.0. Adaptations include three CardioFAD figures, manual slide navigation, one slide at every screen width, contained image sizing, synchronized captions, keyboard controls, and accessible slide state.

`static/css/bulma-carousel.min.css` and `static/js/bulma-carousel.min.js` are unmodified copies distributed by that template. The JavaScript was verified byte-for-byte against the published `bulma-carousel` 4.0.24 npm package. The component is MIT licensed, copyright 2018 CreativeBulma; its original license is included in `static/licenses/BULMA-CAROUSEL-LICENSE.txt`. All dependencies are served locally. No example images or analytics from the reference template are included.

The footer text uses the original Nerfies `container`, centered columns, `column is-8`, and `content` structure with the local Noto Sans font and Bulma footer defaults.
