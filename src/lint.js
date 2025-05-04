export default function () {
  if (
    this.config.cjsFallback &&
    this.packageConfig.dependencies?.jiti === undefined
  ) {
    throw new Error(
      'Please add jiti to your project since cjsFallback is activated.',
    );
  }
}
