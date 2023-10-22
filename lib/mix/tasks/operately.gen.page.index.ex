defmodule Mix.Tasks.Operately.Gen.Page.Index do
  import Mix.Operately, only: [generate_file: 2, indent: 2]

  def run(_args) do
    pages = list_pages()

    generate_file("assets/js/pages/index.tsx", fn _ ->
      """
      //
      // Automatically generated by mix operately.gen.page.index
      // Do not edit this file directly
      //

      #{import_statements(pages)}

      export default {
        #{indent(Enum.join(pages, ",\n"), 2)}
      };
      """
    end)
  end

  def import_statements(pages) do
    pages
    |> Enum.map(fn page -> "import * as #{page} from \"./#{page}\";" end)
    |> Enum.join("\n")
  end

  def list_pages do
    Path.wildcard("assets/js/pages/*")
    |> Enum.map(fn path -> Path.basename(path) end)
    |> Enum.filter(fn name -> name != "index.tsx" end)
  end

end
