import setuptools
from glob import glob

setuptools.setup(
    name='nbtimetravel',
    version='0.1.0',
    url="https://github.com/yuvipanda/nbtimetravel",
    author="Yuvi Panda",
    description="Jupyter Notebook extension to provide per-cell history recording & replaying",
    data_files=[
        ('share/jupyter/nbextensions/nbhistory', glob('*.js'))
    ],
    packages=setuptools.find_packages()
)
