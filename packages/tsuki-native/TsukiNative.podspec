require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name = "TsukiNative"
  s.version = package["version"]
  s.summary = package["description"]
  s.homepage = package["homepage"]
  s.license = { :type => package["license"], :file => "LICENSE" }
  s.author = "ftsukic"
  s.source = { :git => package["repository"]["url"], :tag => "tsuki-native-v#{s.version}" }
  s.platforms = { :ios => min_ios_version_supported }
  s.module_name = "TsukiNative"
  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.pod_target_xcconfig = { "DEFINES_MODULE" => "YES" }

  install_modules_dependencies(s)
end
