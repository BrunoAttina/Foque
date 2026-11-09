Pod::Spec.new do |s|
  s.name           = 'FocoTela'
  s.version        = '0.1.0'
  s.summary        = 'Detecta bloqueio de tela vs. sair do app'
  s.description    = 'Detecta bloqueio de tela vs. sair do app durante uma sessão de foco.'
  s.license        = 'MIT'
  s.author         = 'Foque'
  s.homepage       = 'https://github.com/BrunoAttina/Foque'
  s.platforms      = {
    :ios => '16.4'
  }
  s.source         = { git: 'https://github.com/BrunoAttina/Foque.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
