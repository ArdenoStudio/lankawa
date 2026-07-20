from setuptools import setup

setup(
    name="sl-bank-fd-rates-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for SL Bank Fixed Deposit Rates (educational)",
    url="https://github.com/Cookie-Cat21/sl-bank-fd-rates-docs",
    packages=["sl_bank_fd_rates_docs"],
    package_dir={"sl_bank_fd_rates_docs": "sl_bank_fd_rates_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)
