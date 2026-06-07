package config

type Config struct {
	ListenAddr    string
	BufferSize    int
	MaxBodySize   int
	RedactHeaders []string
	RedactFields  []string
}

func Default() Config {
	return Config{
		ListenAddr:  ":8765",
		BufferSize:  500,
		MaxBodySize: 32768,
		RedactHeaders: []string{
			"Authorization",
			"Cookie",
			"Set-Cookie",
		},
		RedactFields: []string{
			"password",
			"token",
			"secret",
		},
	}
}
