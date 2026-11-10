<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Keep portfolio image/render surfaces immediately visible without scroll masks; reversible paint belongs only on decorative mural surfaces, never reading-content ancestors.
- Keep entry pigment deposition in the persistent hero canvas as additive layers whose weights sum to the source image, with the same crop as the fallback image; hydration starts a fresh sequence and the image stays visible without JavaScript or with reduced motion.
- Keep the page-wide painting in one fixed Canvas2D source behind `main`, driven by a deterministic scroll plan; a sibling WebGL surface may add transient motion without changing deposit amounts or content visibility.
- Use the shared ink clock for artwork motion and entry; WebGL surfaces process art only, pause offscreen/hidden and retain Canvas2D/static fallbacks to avoid content distortion and extra animation loops.
- Serve exact original portfolio images through asset pointers so Canvas/WebGL can read their pixels without relying on external-host CORS.
- Pointer brush deposits overlapping procedural watercolour wash stamps (watercolor-stamps.ts) plus occasional full pigment-brush.png dry-brush stamps into the shader density map; never tile thin texture slices, which reads as a ribbon.
