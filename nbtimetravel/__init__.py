def _jupyter_nbextension_paths():
    return [{
        "section": "notebook",
        "dest": "noteboard-nbextension",
        "src": "static",
        "require": "noteboard-nbextension/main"
    }]
