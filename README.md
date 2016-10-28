# nbtimetravel #

A Jupyter Extension that records each cell's contents & output each time you execute a cell, and allows you to see the history of the whole notebook (and individual cells) over time.

Currently it just records this information, but there is no UI to replay it. That is being currently worked on.

## How? ##

Each time a cell gets executed, this extension saves the following information in the metadata for each cell:

  1. Code being executed
  2. Timestamp at which the execution finished
  3. The response from the kernel
  
With this, we can time travel to see how a notebook has evolved over time. It also enables certain fun future analysis of how code evolves while people are writing it.

## Limitations ##

1. Since this stores all versions of your code and output in the notebook, itmight increase the size of your notebook a fair bit! This could cause issues such as failure to save if your notebook has a lot of images.
2. Doesn't deal well with deleted cells - those currently just 'disappear'.
3. Doesn't version notebook metadata, so if you changed which kernel this was running - that wouldn't be recorded.

## Installation ##

Install this module with pip from git first

```bash
pip install git+https://github.com/yuvipanda/nbtimetravel.git
```

Then you can install & enable the extension

```
jupyter nbextension install --user --py nbtimetravel
jupyter nbextension enable --user --py nbtimetravel
```

This installs it for the current user. You can use `--system` to install it systemwide (needs `root`) too.
