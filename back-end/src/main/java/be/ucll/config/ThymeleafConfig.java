package be.ucll.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.ITemplateEngine;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.StringTemplateResolver;

@Configuration
public class ThymeleafConfig {

    @Bean(name = "dbTemplateEngine")
    public ITemplateEngine dbTemplateEngine() {
        SpringTemplateEngine templateEngine = new SpringTemplateEngine();

        StringTemplateResolver resolver = new StringTemplateResolver();
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCacheable(false);

        templateEngine.setTemplateResolver(resolver);
        return templateEngine;
    }
}