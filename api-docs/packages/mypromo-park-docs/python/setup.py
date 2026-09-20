from setuptools import setup

setup(
    name="mypromo-park-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for MyPromo.lk (park — ToS) (educational)",
    url="https://github.com/Cookie-Cat21/mypromo-park-docs",
    packages=["mypromo_park_docs"],
    package_dir={"mypromo_park_docs": "mypromo_park_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)
