#!/usr/bin/env elixir

defmodule ReleaseBuilder do
  def run(version) do
    validate_version(version)

    path = "build/#{version}"

    IO.puts("Building release in #{path}")

    create_build_dir(path)
    build_docker_compose_file(path, version)
    build_docker_env_file(path)
    zip_build_dir(path)

    IO.puts("\nRelease built! 🎉")
  end

  def create_build_dir(path) do
    IO.puts("* Creating build directory")
    File.mkdir_p!(path)
  end

  def build_docker_compose_file(build_path, version) do
    IO.puts("* Injecting docker-compose.yml")
    template_path = get_template_path("docker-compose.yml.eex")
    output_path = Path.join([build_path, "docker-compose.yml"])
    content = EEx.eval_file(template_path, [version: version])
    File.write!(output_path, content)
  end

  def build_docker_env_file(build_path) do
    IO.puts("* Injecting operately.env")
    template_path = get_template_path("operately.env")
    output_path = Path.join([build_path, "operately.env"])
    content = File.read!(template_path)
    File.write!(output_path, content)
  end

  def get_template_path(file_name) do
    cwd = __ENV__.file |> Path.dirname() 
    Path.join([cwd, "templates", file_name])
  end

  def zip_build_dir(build_path) do
    zip_path = "#{build_path}.zip"
    IO.puts("* Zipping to #{zip_path}")
    System.cmd("zip", ["-r", "-q", zip_path, build_path])
  end

  def validate_version(version) do
    if version == nil || version == "" || String.length(version) < 2 do
      IO.puts("Error: Version is required, e.g elixir rel/single-host/build.ex 1.0.0")
      System.halt(1)
    end
  end
end

version = System.argv() |> List.first()
ReleaseBuilder.run(version)
