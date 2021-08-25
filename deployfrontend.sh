rsync -r public/ docs/
rsync -av src/ docs/
rm -r docs/contracts/
git add .
git commit -m "Compile assets for Github Pages"
git push -u origin master