import json
from os import path
import requests

from sh import git, mkdir, curl
from bs4 import BeautifulSoup

class PhetScraper(object):

  def __init__(self, repos = "repositories.json"):
    self.repos = json.load(open(repos))

  def scrape_thumbnails(self, index_page):
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
        continue
      image_url = index_page.replace(r.request.path_url, img_path.attrs['src'])
      image_path = path.join(path.dirname(__file__), "images/%s.png" % project_name)
      r = requests.get(image_url)
      if r.ok:
        with open(image_path, "wb") as f:
          f.write(r.content)

  def generate_index(self):
    pass

if __name__ == '__main__':
  scraper = PhetScraper()
  scraper.scrape_thumbnails("https://phet.colorado.edu/en/simulations/category/new")
  # scraper.generate_index()
  # scraper.update_repos()
  # scraper.compile_simulations()