import json
from os import path
import requests
import codecs

from argparse import ArgumentParser
from sh import git, mkdir, curl, cd, npm, cp
from bs4 import BeautifulSoup
from jinja2 import Environment, FileSystemLoader

__all__ = ["PhetScraper"]

class PhetScraper(object):

  def __init__(self, repos = "repositories.json"):
    self.repos = json.load(open(repos))

  def scrape_thumbnails(self, index_page = "https://phet.colorado.edu/en/simulations/category/new"):
    r = requests.get(index_page)
    if not r.ok:
      print "Failed Scrape!"
      return
    page = BeautifulSoup(r.content)
    for img_path in page.find_all(class_ = "simulation-list-thumbnail"):
      # url format: sims/html/<project_name>/<version>/<file>
      if not 'src' in img_path.attrs:
        continue
      project_name = img_path.attrs['src'].split('/')[3]
      if project_name not in self.repos:
        self.repos[project_name] = "https://github.com/phetsims/%s.git" % project_name
      image_url = index_page.replace(r.request.path_url, img_path.attrs['src'])
      image_path = path.join(path.dirname(path.realpath(__file__)), "sims/images/%s.png" % project_name)
      r = requests.get(image_url)
      if r.ok:
        with open(image_path, "wb") as f:
          f.write(r.content)
    json.dump(self.repos, open("repositories.json", "wb"))

  def generate_index(self, locales="en"):
    print "Generating Index"
    base_path = path.dirname(path.realpath(__file__))
    env = Environment(loader=FileSystemLoader(base_path))
    template = env.get_template('index.html')
    for l in locales.split(','):
      sims = {name : u"%s_%s.html" % (name, l) for name in self.repos}
      with codecs.open("%s/index_%s.html" % (path.join(base_path, "sims"), l), 'w', 'utf-8') as f:
        f.write(template.render(sims = sims).decode('utf-8', 'ignore'))

  def update_repos(self):
    git.submodule.update()
    for name, repo in self.repos.iteritems():
      git.clone(repo)

  def compile_simulations(self, locales="en"):
    # if this doesn't work, the paths for the commands are different. The shell script is (per repo):
    # cd repo
    # npm install
    # grunt build --force --locales=locales
    # cp $name_$locale.html ..
    # cp js/* ../js
    # cp images/* ../images
    # cd ..
    # rm -rf $name
    for name in self.repos:
      if path.exists(name):
        cd(name)
        # npm.install()
        # grunt.build(force=True, locales=locales)
        cp("*.html", "../sims")
        cp("images/*", "../sims/images")
        cp("js/*", "../sims/js")
        cd("..")
        rm("-rf", name)

if __name__ == '__main__':
  parser = ArgumentParser()
  parser.add_argument("--scrape_thumbs", help="scrape thumbnails", action="store_true")
  parser.add_argument("--download_repos", help="clone the git repos", action="store_true")
  parser.add_argument("--locales", default = "en", help="short form locales, i.e. ar,fr,es. English by default.")
  args = parser.parse_args()
  scraper = PhetScraper()
  if args.scrape_thumbs:
    scraper.scrape_thumbnails()
  scraper.generate_index(args.locales)
  if args.download_repos:
    scraper.update_repos()
  scraper.compile_simulations(args.locales)